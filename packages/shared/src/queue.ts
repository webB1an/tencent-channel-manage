/**
 * Queue and job names shared between the API (producer) and the worker
 * (consumer). Keep this file dependency-free.
 */

/** Single BullMQ queue that both inspection and hot-summary jobs go into. */
export const QUEUE_NAME = "tcm.tasks";

/** Job name: "scan a channel for risky posts". */
export const JOB_INSPECTION = "task.inspection";

/** Job name: "produce a daily hot-post summary for a channel". */
export const JOB_HOT_SUMMARY = "task.hot_summary";

/**
 * Group key for BullMQ's groups feature. Jobs that share a group run
 * serially, so the same `tokenId` is never invoked concurrently.
 * See apps/worker/src/index.ts for the actual group configuration.
 */
export const taskGroupKey = (tokenId: string): string => `token:${tokenId}`;

export interface TaskRunJobData {
  /** TaskRun.id (DB row). */
  runId: string;
  /** Task.id (DB row). */
  taskId: string;
  userId: string;
  tokenId: string;
  modelId: string | null;
  guildId: string | null;
  channelId: string | null;
  type: "INSPECTION" | "HOT_SUMMARY";
  scheduleMode: "IMMEDIATE" | "DAILY";
  /** HH:mm. Used when scheduleMode = DAILY. */
  defaultTime: string;
  /** User-supplied params (free-form). */
  params: Record<string, unknown>;
  /**
   * Producer-supplied stable key. The worker uses this both for
   * TaskRun.idempotencyKey and to dedupe enqueues.
   */
  idempotencyKey: string;
}
