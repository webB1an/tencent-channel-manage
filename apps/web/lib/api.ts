/// Tiny fetch wrapper. In MVP we ship a mock layer that returns canned data
/// when NEXT_PUBLIC_USE_MOCK=1 so the UI can be developed and demoed without
/// the API running. Set NEXT_PUBLIC_API_BASE to point at a real Fastify
/// instance when you want the live wiring.

import type {
  GuildView,
  ChannelView,
  HotSummaryView,
  InspectionResultView,
  ModelView,
  TaskRunView,
  TaskView,
  TokenView,
} from "@tcm/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

type ApiErrorPayload = {
  error?: string;
  message?: string;
  issues?: Array<{ field: string; message: string }>;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("tcm_token");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    try {
      const payload = JSON.parse(text) as ApiErrorPayload;
      const issueText = payload.issues?.map((issue) => `${issue.field}: ${issue.message}`).join("; ");
      throw new Error(payload.message ?? issueText ?? payload.error ?? `${res.status} ${text}`);
    } catch (err) {
      if (err instanceof SyntaxError) throw new Error(`${res.status} ${text}`);
      throw err;
    }
  }
  return (await res.json()) as T;
}

// --- mock data ---------------------------------------------------------------

const today = () => new Date().toISOString().slice(0, 10);

const mockTokens: TokenView[] = [
  { id: "tk1", label: "主号", tokenTail: "3a7f", status: "ACTIVE", lastCheckedAt: null, createdAt: new Date().toISOString() },
];
const mockModels: ModelView[] = [
  { id: "m1", provider: "deepseek", model: "deepseek-chat", baseUrl: null, lastTestedAt: null, createdAt: new Date().toISOString() },
];
const mockTasks: TaskView[] = [
  {
    id: "t1",
    type: "INSPECTION",
    scheduleMode: "DAILY",
    defaultTime: "23:30",
    status: "ACTIVE",
    enabled: true,
    tokenId: "tk1",
    modelId: "m1",
    guildId: null,
    channelId: null,
    params: { topN: 10 },
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
  {
    id: "t2",
    type: "HOT_SUMMARY",
    scheduleMode: "DAILY",
    defaultTime: "09:00",
    status: "ACTIVE",
    enabled: true,
    tokenId: "tk1",
    modelId: "m1",
    guildId: null,
    channelId: null,
    params: {},
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
];
const mockRuns: TaskRunView[] = [
  { id: "r1", taskId: "t1", status: "SUCCESS", retryCount: 0, startedAt: new Date(Date.now() - 1800_000).toISOString(), finishedAt: new Date(Date.now() - 1790_000).toISOString(), exitCode: 0, error: null, createdAt: new Date(Date.now() - 1800_000).toISOString() },
  { id: "r2", taskId: "t1", status: "RUNNING", retryCount: 0, startedAt: new Date(Date.now() - 60_000).toISOString(), finishedAt: null, exitCode: null, error: null, createdAt: new Date(Date.now() - 60_000).toISOString() },
];
const mockSummaries: HotSummaryView[] = [
  {
    id: "s1",
    taskId: "t2",
    date: today(),
    items: [
      { topic: "新版本发布", mentions: 142 },
      { topic: "活动福利", mentions: 98 },
      { topic: "经验分享", mentions: 64 },
    ],
    createdAt: new Date().toISOString(),
  },
];
const mockInspections: InspectionResultView[] = [
  {
    id: "i1",
    runId: "r1",
    taskId: "t1",
    guildId: "g1",
    channelId: "c1",
    postId: "p1",
    title: "重复广告内容",
    content: "短时间内重复发布相似推广内容。",
    authorName: "示例用户",
    likeCount: 3,
    commentCount: 1,
    postCreatedAt: new Date().toISOString(),
    postIds: ["p1", "p2"],
    riskLevel: "MEDIUM",
    riskTypes: ["spam"],
    reason: "短时间内大量重复内容",
    status: "PROCESSED",
    createdAt: new Date().toISOString(),
  },
];
const mockGuilds: GuildView[] = [
  {
    id: "g1",
    tokenId: "tk1",
    guildId: "guild-001",
    name: "示例频道",
    guildNumber: "pd000000",
    role: "频道主",
    memberCount: 12,
    shareUrl: null,
    cachedAt: new Date().toISOString(),
  },
];
const mockChannels: ChannelView[] = [
  { id: "c1", guildId: "g1", channelId: "channel-001", name: "综合", cachedAt: new Date().toISOString() },
];

// --- API surface -------------------------------------------------------------

export const api = {
  async login(username: string, password: string) {
    if (USE_MOCK) {
      const fake = "mock." + Math.random().toString(36).slice(2);
      return { token: fake, user: { id: "u1", username, role: username === "admin" ? ("ADMIN" as const) : ("USER" as const) } };
    }
    return request<{ token: string; user: { id: string; username: string; role: "ADMIN" | "USER" } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify({ username, password }) },
    );
  },

  async logout() {
    if (USE_MOCK) return { ok: true };
    return request<{ ok: boolean }>("/api/auth/logout", { method: "POST", body: "{}" });
  },

  async listTasks() {
    return USE_MOCK ? mockTasks : request<TaskView[]>("/api/tasks");
  },
  async createTask(input: {
    type: "INSPECTION" | "HOT_SUMMARY";
    tokenId: string;
    modelId?: string | null;
    guildId: string;
    channelId?: string | null;
    scheduleMode: "IMMEDIATE" | "DAILY";
    defaultTime?: string;
    params?: Record<string, unknown>;
  }) {
    return USE_MOCK ? ({ id: "task-new" } as { id: string; runId?: string }) : request<{ id: string; runId?: string }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ ...input, defaultTime: input.defaultTime ?? "23:30", params: input.params ?? {}, enabled: true }),
    });
  },
  async updateTask(
    id: string,
    payload: {
      enabled?: boolean;
      status?: TaskView["status"];
      defaultTime?: string;
      channelId?: string | null;
      scheduleMode?: TaskView["scheduleMode"];
      params?: Record<string, unknown>;
    },
  ) {
    if (USE_MOCK) {
      const idx = mockTasks.findIndex((t) => t.id === id);
      if (idx >= 0) {
        const merged = { ...mockTasks[idx] };
        if (payload.defaultTime !== undefined) merged.defaultTime = payload.defaultTime;
        if (payload.channelId !== undefined) merged.channelId = payload.channelId;
        if (payload.scheduleMode !== undefined) merged.scheduleMode = payload.scheduleMode;
        if (payload.params !== undefined) merged.params = payload.params;
        if (payload.enabled !== undefined) merged.enabled = payload.enabled;
        if (payload.status !== undefined) merged.status = payload.status;
        mockTasks[idx] = merged;
      }
      return { id, ...payload };
    }
    return request<{ id: string; enabled?: boolean; status?: TaskView["status"]; defaultTime?: string; channelId?: string | null; scheduleMode?: TaskView["scheduleMode"] }>(
      `/api/tasks/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
  },
  async listRuns(taskId: string) {
    return USE_MOCK ? mockRuns : request<TaskRunView[]>(`/api/tasks/${taskId}/runs`);
  },
  async runTask(taskId: string) {
    return USE_MOCK ? { runId: "r-new" } : request<{ runId: string }>(`/api/tasks/${taskId}/run`, { method: "POST" });
  },
  async listSummaries(date?: string) {
    if (USE_MOCK) return date ? mockSummaries.filter((s) => s.date === date) : mockSummaries;
    const q = date ? `?date=${date}` : "";
    return request<HotSummaryView[]>(`/api/results/summaries${q}`);
  },
  async listInspections() {
    return USE_MOCK ? mockInspections : request<InspectionResultView[]>("/api/results/inspections");
  },
  async listTokens() {
    return USE_MOCK ? mockTokens : request<TokenView[]>("/api/tokens");
  },
  async createToken(label: string, secret: string) {
    return USE_MOCK ? { id: "tk-new", label, tokenTail: secret.slice(-4) } : request<{ id: string; label: string; tokenTail: string }>("/api/tokens", {
      method: "POST",
      body: JSON.stringify({ label, secret }),
    });
  },
  async updateToken(id: string, input: { label?: string; secret?: string }) {
    return USE_MOCK
      ? { id, label: input.label ?? "mock", tokenTail: input.secret?.slice(-4) ?? "3a7f", status: "ACTIVE" }
      : request<TokenView>(`/api/tokens/${id}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        });
  },
  async checkToken(id: string) {
    return USE_MOCK ? { ok: true, status: "ACTIVE" } : request<{ ok: boolean; status: string; message?: string }>(`/api/tokens/${id}/check`, { method: "POST", body: "{}" });
  },
  async syncGuilds(tokenId: string) {
    return USE_MOCK ? { ok: true, count: 1 } : request<{ ok: boolean; count: number }>(`/api/tokens/${tokenId}/sync-guilds`, { method: "POST", body: "{}" });
  },
  async listModels() {
    return USE_MOCK ? mockModels : request<ModelView[]>("/api/models");
  },
  async createModel(input: { provider: string; model: string; baseUrl?: string | null; apiKey: string }) {
    return USE_MOCK ? { id: "m-new", ...input } : request<ModelView>("/api/models", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async testModel(id: string) {
    return USE_MOCK ? { ok: true } : request<{ ok: boolean; lastTestedAt?: string }>(`/api/models/${id}/test`, { method: "POST", body: "{}" });
  },
  async listGuilds(tokenId?: string) {
    const q = tokenId ? `?tokenId=${tokenId}` : "";
    return USE_MOCK ? mockGuilds : request<Array<GuildView & { channels?: ChannelView[] }>>(`/api/guilds${q}`);
  },
  async syncChannels(guildId: string) {
    return USE_MOCK ? { ok: true, count: 1 } : request<{ ok: boolean; count: number }>(`/api/guilds/${guildId}/sync-channels`, { method: "POST", body: "{}" });
  },
  async listChannels(guildId?: string) {
    const q = guildId ? `?guildId=${guildId}` : "";
    return USE_MOCK ? mockChannels : request<ChannelView[]>(`/api/channels${q}`);
  },
  async updateInspection(id: string, status: "PENDING" | "PROCESSED" | "IGNORED") {
    return request<InspectionResultView>(`/api/results/inspections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  async riskAction(id: string, action: "delete_post" | "mute_author", reason: string, muteSeconds?: number) {
    return request<{ ok: boolean }>(`/api/results/inspections/${id}/risk-action`, {
      method: "POST",
      body: JSON.stringify({ action, reason, muteSeconds }),
    });
  },
};

export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem("tcm_token", t);
  else window.localStorage.removeItem("tcm_token");
}
