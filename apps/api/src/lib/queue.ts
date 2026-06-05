import { Queue } from "bullmq";
import { config } from "../config.js";
import { JOB_HOT_SUMMARY, JOB_INSPECTION, QUEUE_NAME, type TaskRunJobData } from "@tcm/shared";

function getConnection() {
  return {
    ...parseRedisUrl(config.redisUrl),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

let _queue: Queue | null = null;
export function getTaskQueue(): Queue {
  if (!_queue) {
    _queue = new Queue(QUEUE_NAME, {
      connection: getConnection(),
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 500,
        attempts: 2,
        backoff: { type: "exponential", delay: 5_000 },
      },
    });
  }
  return _queue;
}

export async function enqueueTaskRun(data: TaskRunJobData) {
  const queue = getTaskQueue();
  const jobName = data.type === "INSPECTION" ? JOB_INSPECTION : JOB_HOT_SUMMARY;
  await queue.add(jobName, data, { jobId: data.idempotencyKey });
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
