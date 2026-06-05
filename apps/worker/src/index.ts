import "dotenv/config";
import { Queue, Worker, type Job } from "bullmq";
import { prisma } from "@tcm/db";
import { config } from "./config.js";
import {
  JOB_HOT_SUMMARY,
  JOB_INSPECTION,
  QUEUE_NAME,
  type TaskRunJobData,
  taskGroupKey,
} from "@tcm/shared";
import { handleTaskRun } from "./handlers/task.js";

function newConn() {
  return {
    ...parseRedisUrl(config.redisUrl),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 4);

const queue = new Queue(QUEUE_NAME, {
  connection: newConn(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
});

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job<TaskRunJobData>) => {
    if (!job.data?.tokenId) throw new Error("missing tokenId");
    return runSerialized(taskGroupKey(job.data.tokenId), () => handleTaskRun(job.data));
  },
  { connection: newConn(), concurrency },
);

const inflight = new Map<string, Promise<unknown>>();

function runSerialized<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = inflight.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  inflight.set(
    key,
    next.finally(() => {
      if (inflight.get(key) === next) inflight.delete(key);
    }),
  );
  return next;
}

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed: ${err.message}`);
});

const schedulerTimer = setInterval(() => {
  enqueueDueDailyTasks().catch((err) => {
    console.error(`[worker] scheduler failed: ${(err as Error).message}`);
  });
}, 60_000);
void enqueueDueDailyTasks();

async function enqueueDueDailyTasks() {
  const { date, hhmm } = shanghaiNow();
  const tasks = await prisma.task.findMany({
    where: {
      enabled: true,
      status: "ACTIVE",
      scheduleMode: "DAILY",
      defaultTime: hhmm,
    },
  });
  for (const task of tasks) {
    const idempotencyKey = `daily:${task.id}:${date}`;
    const run = await prisma.taskRun.upsert({
      where: { idempotencyKey },
      update: {},
      create: {
        taskId: task.id,
        userId: task.userId,
        status: "PENDING",
        idempotencyKey,
      },
    });
    await queue.add(
      task.type === "INSPECTION" ? JOB_INSPECTION : JOB_HOT_SUMMARY,
      {
        runId: run.id,
        taskId: task.id,
        userId: task.userId,
        tokenId: task.tokenId,
        modelId: task.modelId,
        guildId: task.guildId,
        channelId: task.channelId,
        type: task.type as TaskRunJobData["type"],
        scheduleMode: task.scheduleMode as TaskRunJobData["scheduleMode"],
        defaultTime: task.defaultTime,
        params: JSON.parse(task.paramsJson),
        idempotencyKey,
      },
      { jobId: idempotencyKey },
    );
  }
}

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
  };
}

function shanghaiNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    hhmm: `${part("hour")}:${part("minute")}`,
  };
}

async function shutdown() {
  console.log("[worker] draining...");
  clearInterval(schedulerTimer);
  await worker.close();
  await queue.close();
  await prisma.$disconnect();
}

process.on("SIGINT", () => void shutdown().then(() => process.exit(0)));
process.on("SIGTERM", () => void shutdown().then(() => process.exit(0)));

console.log(`[worker] started, queue=${QUEUE_NAME} concurrency=${concurrency}`);
