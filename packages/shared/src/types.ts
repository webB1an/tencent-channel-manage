/**
 * Public DTO shapes returned by the API to the web / mobile client.
 * Field names mirror the wire format (camelCase) and never expose
 * encrypted blobs or other internal columns.
 */

import type {
  RiskLevel,
  ResultStatus,
  ScheduleMode,
  TaskRunStatus,
  TaskStatus,
  TaskType,
  TokenStatus,
  ModelProvider,
  UserRole,
} from "./enums.js";

export type {
  RiskLevel,
  ResultStatus,
  ScheduleMode,
  TaskRunStatus,
  TaskStatus,
  TaskType,
  TokenStatus,
  ModelProvider,
  UserRole,
} from "./enums.js";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface JwtPayload {
  /** userId */
  sub: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TokenView {
  id: string;
  label: string;
  tokenTail: string;
  status: TokenStatus;
  lastCheckedAt: string | null;
  createdAt: string;
}

export interface ModelView {
  id: string;
  provider: ModelProvider;
  model: string;
  baseUrl: string | null;
  lastTestedAt: string | null;
  createdAt: string;
}

export interface GuildView {
  id: string;
  tokenId: string;
  guildId: string;
  name: string;
  guildNumber: string | null;
  role: string | null;
  memberCount: number | null;
  shareUrl: string | null;
  cachedAt: string;
}

export interface ChannelView {
  id: string;
  guildId: string;
  channelId: string;
  name: string;
  cachedAt: string;
}

export interface TaskView {
  id: string;
  type: TaskType;
  scheduleMode: ScheduleMode;
  defaultTime: string;
  status: TaskStatus;
  enabled: boolean;
  tokenId: string;
  modelId: string | null;
  guildId: string | null;
  channelId: string | null;
  params: Record<string, unknown>;
  createdAt: string;
}

export interface TaskRunView {
  id: string;
  taskId: string;
  status: TaskRunStatus;
  retryCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  error: string | null;
  createdAt: string;
}

export interface InspectionResultView {
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
  postCreatedAt: string | null;
  postIds: string[];
  riskLevel: RiskLevel;
  riskTypes: string[];
  reason: string;
  status: ResultStatus;
  createdAt: string;
}

export interface HotSummaryView {
  id: string;
  taskId: string;
  date: string;
  items: unknown[];
  createdAt: string;
}

/** Generic API error shape. */
export interface ApiError {
  error: string;
  message: string;
  issues?: Array<{ field: string; message: string }>;
  details?: unknown;
}
