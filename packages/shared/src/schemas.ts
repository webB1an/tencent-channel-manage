/**
 * Minimal zod request schemas for the API surface used by the MVP.
 * Add new schemas next to the relevant domain; do not lump them together.
 */
import { z } from "zod";
import {
  DEFAULT_TASK_TIME,
  ModelProvider,
  ScheduleMode,
  TaskType,
  TokenStatus,
} from "./enums.js";

// ---------- shared primitives ----------

const username = z.string().min(3).max(64);
const password = z.string().min(8).max(128);
const loginPassword = z.string().min(1).max(128);

const hhmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be HH:mm (24h)")
  .describe("HH:mm (24h)");

// ---------- auth ----------

export const registerSchema = z.object({
  username,
  password,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username,
  password: loginPassword,
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- channel token ----------

export const createTokenSchema = z.object({
  label: z.string().min(1, "名称不能为空").max(64, "名称不能超过 64 个字符"),
  /// Plain token. Received over HTTPS, never logged, encrypted at rest.
  secret: z.string().min(8, "Token 至少需要 8 位").max(4096, "Token 不能超过 4096 位"),
});
export type CreateTokenInput = z.infer<typeof createTokenSchema>;

export const updateTokenSchema = createTokenSchema
  .partial()
  .refine((v) => v.label !== undefined || v.secret !== undefined, {
    message: "至少需要修改一个字段",
  });
export type UpdateTokenInput = z.infer<typeof updateTokenSchema>;

export const updateTokenStatusSchema = z.object({
  status: z.nativeEnum(TokenStatus),
});
export type UpdateTokenStatusInput = z.infer<typeof updateTokenStatusSchema>;

// ---------- model config ----------

export const createModelSchema = z.object({
  provider: z.nativeEnum(ModelProvider),
  model: z.string().min(1).max(128),
  baseUrl: z.string().url().max(512).nullable().optional(),
  apiKey: z.string().min(8).max(1024),
});
export type CreateModelInput = z.infer<typeof createModelSchema>;

export const updateModelSchema = createModelSchema
  .partial()
  .refine(
    (v) =>
      v.provider !== undefined ||
      v.model !== undefined ||
      v.baseUrl !== undefined ||
      v.apiKey !== undefined,
    { message: "at least one field must be present" },
  );
export type UpdateModelInput = z.infer<typeof updateModelSchema>;

// ---------- task ----------

export const createTaskSchema = z.object({
  type: z.nativeEnum(TaskType),
  tokenId: z.string().min(1),
  modelId: z.string().min(1).nullable().optional(),
  guildId: z.string().min(1).nullable().optional(),
  channelId: z.string().min(1).nullable().optional(),
  scheduleMode: z.nativeEnum(ScheduleMode).default(ScheduleMode.DAILY),
  defaultTime: hhmm.default(DEFAULT_TASK_TIME),
  params: z.record(z.unknown()).default({}),
  enabled: z.boolean().default(true),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine(
    (v) =>
      v.type !== undefined ||
      v.tokenId !== undefined ||
      v.modelId !== undefined ||
      v.guildId !== undefined ||
      v.channelId !== undefined ||
      v.scheduleMode !== undefined ||
      v.defaultTime !== undefined ||
      v.params !== undefined ||
      v.enabled !== undefined,
    { message: "at least one field must be present" },
  );
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// ---------- guild / channel (cache) ----------

export const upsertGuildSchema = z.object({
  guildId: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
});
export type UpsertGuildInput = z.infer<typeof upsertGuildSchema>;

export const upsertChannelSchema = z.object({
  guildId: z.string().min(1),
  channelId: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
});
export type UpsertChannelInput = z.infer<typeof upsertChannelSchema>;
