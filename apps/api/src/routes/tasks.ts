import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";
import {
  createTaskSchema,
  TaskRunStatus,
  TaskType,
  ScheduleMode,
  TaskStatus,
} from "@tcm/shared";
import { enqueueTaskRun } from "../lib/queue.js";

export async function taskRoutes(app: FastifyInstance) {
  app.get("/api/tasks", async (req) => {
    const rows = await prisma.task.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((t) => ({
      id: t.id,
      type: t.type as TaskType,
      scheduleMode: t.scheduleMode as ScheduleMode,
      defaultTime: t.defaultTime,
      status: t.status as TaskStatus,
      enabled: t.enabled,
      tokenId: t.tokenId,
      modelId: t.modelId,
      guildId: t.guildId,
      channelId: t.channelId,
      params: JSON.parse(t.paramsJson),
      createdAt: t.createdAt.toISOString(),
    }));
  });

  app.post("/api/tasks", async (req, reply) => {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    const {
      type,
      tokenId,
      modelId,
      guildId,
      channelId,
      scheduleMode,
      defaultTime,
      params,
      enabled,
    } = parsed.data;

    // Ownership checks — never let one user schedule against another's token.
    const token = await prisma.channelToken.findFirst({
      where: { id: tokenId, userId: req.user!.sub, status: "ACTIVE" },
    });
    if (!token) return reply.code(400).send({ error: "invalid_token" });
    if (type === "INSPECTION" && !modelId) {
      return reply.code(400).send({ error: "model_required" });
    }
    if (!guildId || !channelId) {
      return reply.code(400).send({ error: "guild_and_channel_required" });
    }
    if (modelId) {
      const m = await prisma.modelConfig.findFirst({ where: { id: modelId, userId: req.user!.sub } });
      if (!m) return reply.code(400).send({ error: "invalid_model" });
    }
    const guild = await prisma.guild.findFirst({ where: { id: guildId, userId: req.user!.sub, tokenId } });
    if (!guild) return reply.code(400).send({ error: "invalid_guild" });
    const channel = await prisma.channel.findFirst({ where: { id: channelId, guildId: guild.id } });
    if (!channel) return reply.code(400).send({ error: "invalid_channel" });

    const task = await prisma.task.create({
      data: {
        userId: req.user!.sub,
        tokenId,
        modelId: modelId ?? null,
        guildId: guildId ?? null,
        channelId: channelId ?? null,
        type,
        scheduleMode,
        defaultTime,
        paramsJson: JSON.stringify(params),
        enabled,
        status: "ACTIVE",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: "task.create",
        target: task.id,
        metaJson: JSON.stringify({ type, scheduleMode }),
      },
    });

    if (scheduleMode === "IMMEDIATE") {
      const run = await createAndEnqueueRun(req.user!.sub, task.id, "manual");
      return { id: task.id, runId: run.id };
    }
    return { id: task.id };
  });

  app.post("/api/tasks/:id/run", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user!.sub },
    });
    if (!task) return reply.code(404).send({ error: "not_found" });
    if (task.status !== "ACTIVE" || !task.enabled) {
      return reply.code(400).send({ error: "task_not_runnable" });
    }

    const run = await createAndEnqueueRun(req.user!.sub, task.id, "manual");
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: "task.run",
        target: run.id,
        metaJson: JSON.stringify({ taskId: task.id }),
      },
    });

    return { runId: run.id };
  });

  app.get("/api/tasks/:id/runs", async (req) => {
    const id = (req.params as { id: string }).id;
    const rows = await prisma.taskRun.findMany({
      where: { taskId: id, userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      status: r.status as TaskRunStatus,
      retryCount: r.retryCount,
      startedAt: r.startedAt?.toISOString() ?? null,
      finishedAt: r.finishedAt?.toISOString() ?? null,
      exitCode: r.exitCode,
      error: r.error,
      createdAt: r.createdAt.toISOString(),
    }));
  });

  app.patch("/api/tasks/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const body = req.body as { enabled?: boolean; status?: string };
    const task = await prisma.task.findFirst({ where: { id, userId: req.user!.sub } });
    if (!task) return reply.code(404).send({ error: "not_found" });
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    });
    return { id: updated.id, enabled: updated.enabled, status: updated.status };
  });
}

async function createAndEnqueueRun(userId: string, taskId: string, mode: "manual" | "daily") {
  const task = await prisma.task.findFirstOrThrow({ where: { id: taskId, userId } });
  const date = new Date().toISOString().slice(0, 10);
  const idempotencyKey = mode === "daily" ? `daily:${task.id}:${date}` : `manual:${task.id}:${Date.now()}`;
  const run = await prisma.taskRun.upsert({
    where: { idempotencyKey },
    update: {},
    create: {
      taskId: task.id,
      userId,
      status: "PENDING" as TaskRunStatus,
      idempotencyKey,
    },
  });
  await enqueueTaskRun({
    runId: run.id,
    taskId: task.id,
    userId,
    tokenId: task.tokenId,
    modelId: task.modelId,
    guildId: task.guildId,
    channelId: task.channelId,
    type: task.type as TaskType,
    scheduleMode: task.scheduleMode as ScheduleMode,
    defaultTime: task.defaultTime,
    params: JSON.parse(task.paramsJson),
    idempotencyKey,
  });
  return run;
}
