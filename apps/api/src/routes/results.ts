import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";
import { RiskLevel, ResultStatus } from "@tcm/shared";

export async function resultRoutes(app: FastifyInstance) {
  app.get("/api/results/summaries", async (req) => {
    const { date } = (req.query as { date?: string });
    const userId = req.user!.sub;
    const rows = await prisma.hotSummary.findMany({
      where: {
        userId,
        ...(date ? { date } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      date: s.date,
      items: JSON.parse(s.itemsJson),
      createdAt: s.createdAt.toISOString(),
    }));
  });

  app.get("/api/results/inspections", async (req) => {
    const { status } = req.query as { status?: string };
    const rows = await prisma.inspectionResult.findMany({
      where: {
        userId: req.user!.sub,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map(inspectionView);
  });

  app.get("/api/results/inspections/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.inspectionResult.findFirst({
      where: { id, userId: req.user!.sub },
    });
    if (!row) return reply.code(404).send({ error: "not_found" });
    return inspectionView(row);
  });

  app.patch("/api/results/inspections/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const body = req.body as { status?: string };
    if (!["PENDING", "PROCESSED", "IGNORED"].includes(body.status ?? "")) {
      return reply.code(400).send({ error: "bad_status" });
    }
    const row = await prisma.inspectionResult.findFirst({
      where: { id, userId: req.user!.sub },
    });
    if (!row) return reply.code(404).send({ error: "not_found" });
    const updated = await prisma.inspectionResult.update({
      where: { id },
      data: { status: body.status },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: `inspection.${body.status === "IGNORED" ? "ignore" : "mark"}`,
        target: id,
        metaJson: JSON.stringify({ status: body.status }),
      },
    });
    return inspectionView(updated);
  });

  app.post("/api/results/inspections/:id/risk-action", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const body = req.body as { action?: string; reason?: string; muteSeconds?: number };
    if (!["delete_post", "mute_author"].includes(body.action ?? "")) {
      return reply.code(400).send({ error: "bad_action" });
    }
    const row = await prisma.inspectionResult.findFirst({
      where: { id, userId: req.user!.sub },
    });
    if (!row) return reply.code(404).send({ error: "not_found" });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: `risk.${body.action}`,
        target: id,
        metaJson: JSON.stringify({
          reason: body.reason ?? null,
          muteSeconds: body.muteSeconds ?? null,
          postId: row.postId,
        }),
      },
    });
    return { ok: true, message: "audit_recorded_mvp_manual_action" };
  });

  app.get("/api/results/inspections/by-run/:runId", async (req) => {
    const runId = (req.params as { runId: string }).runId;
    const row = await prisma.inspectionResult.findFirst({
      where: { runId, userId: req.user!.sub },
    });
    if (!row) return { runId, payload: null };
    return {
      runId,
      payload: {
        id: row.id,
        taskId: row.taskId,
        postIds: JSON.parse(row.postIdsJson),
        riskLevel: row.riskLevel as RiskLevel,
        riskTypes: JSON.parse(row.riskTypesJson),
        reason: row.reason,
        status: row.status as ResultStatus,
        createdAt: row.createdAt.toISOString(),
      },
    };
  });
}

function inspectionView(row: {
  id: string;
  runId: string;
  taskId: string;
  guildId: string | null;
  channelId: string | null;
  postId: string;
  title: string | null;
  content: string | null;
  authorName: string | null;
  likeCount: number;
  commentCount: number;
  postCreatedAt: Date | null;
  postIdsJson: string;
  riskLevel: string;
  riskTypesJson: string;
  reason: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    runId: row.runId,
    taskId: row.taskId,
    guildId: row.guildId,
    channelId: row.channelId,
    postId: row.postId,
    title: row.title,
    content: row.content,
    authorName: row.authorName,
    likeCount: row.likeCount,
    commentCount: row.commentCount,
    postCreatedAt: row.postCreatedAt?.toISOString() ?? null,
    postIds: JSON.parse(row.postIdsJson),
    riskLevel: row.riskLevel as RiskLevel,
    riskTypes: JSON.parse(row.riskTypesJson),
    reason: row.reason,
    status: row.status as ResultStatus,
    createdAt: row.createdAt.toISOString(),
  };
}
