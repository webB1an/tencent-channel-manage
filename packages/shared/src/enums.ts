/**
 * Canonical enum value lists. These are the source of truth for the
 * string fields stored in SQLite (which has no native enum support).
 *
 * Always reference the values via these constants or the matching
 * zod schemas in `./schemas.js`; never hand-write the strings.
 */

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const TokenStatus = {
  ACTIVE: "ACTIVE",
  REVOKED: "REVOKED",
  INVALID: "INVALID",
} as const;
export type TokenStatus = (typeof TokenStatus)[keyof typeof TokenStatus];

export const ModelProvider = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  DEEPSEEK: "deepseek",
  DOUBAO: "doubao",
  CUSTOM: "custom",
} as const;
export type ModelProvider = (typeof ModelProvider)[keyof typeof ModelProvider];

export const TaskType = {
  INSPECTION: "INSPECTION",
  HOT_SUMMARY: "HOT_SUMMARY",
} as const;
export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const ScheduleMode = {
  /** Enqueue a single run as soon as the task is created / triggered. */
  IMMEDIATE: "IMMEDIATE",
  /** Run once per day at the configured `defaultTime` (HH:mm). */
  DAILY: "DAILY",
} as const;
export type ScheduleMode = (typeof ScheduleMode)[keyof typeof ScheduleMode];

export const TaskStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  DISABLED: "DISABLED",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskRunStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  TIMEOUT: "TIMEOUT",
} as const;
export type TaskRunStatus = (typeof TaskRunStatus)[keyof typeof TaskRunStatus];

export const RiskLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const ResultStatus = {
  PENDING: "PENDING",
  PROCESSED: "PROCESSED",
  IGNORED: "IGNORED",
  FAILED: "FAILED",
} as const;
export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];

/** The "risk taxonomy" used in InspectionResult.riskTypesJson. */
export const RiskType = {
  AD: "ad",
  ABUSE: "abuse",
  SPAM: "spam",
  POLITICS: "politics",
  PORN: "porn",
  OTHER: "other",
} as const;
export type RiskType = (typeof RiskType)[keyof typeof RiskType];

/** Default daily run time, matching the `Task.defaultTime` schema default. */
export const DEFAULT_TASK_TIME = "23:30";
