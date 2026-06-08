"use client";

import { api } from "@/lib/api";
import type { ChannelView, GuildView, TaskRunView, TaskView, TokenView } from "@tcm/shared";

export type AccountStatus = "normal" | "expired" | "running" | "error";
export type TargetLevel = "account" | "channel";
export type RangeType = "all" | "selectedSections";
export type ExecutionMode = "immediate" | "schedule";

export interface Account {
  id: string;
  qq: string;
  tokenTail: string;
  nickname?: string;
  remark?: string;
  status: AccountStatus;
  channelCount?: number;
  pendingTaskCount?: number;
  lastRunAt?: string;
  createdAt?: string;
}

export interface Channel {
  id: string;
  accountId: string;
  channelId: string;
  name: string;
  status?: "normal" | "disabled" | "error";
  sectionCount?: number;
  scheduledTaskCount?: number;
  lastRunAt?: string;
}

type ChannelWithGuild = Channel & { guild: GuildView };

export interface Section {
  id: string;
  accountId: string;
  channelId: string;
  sectionId: string;
  name: string;
  status?: "normal" | "disabled";
}

export interface TaskConfigField {
  key: string;
  label: string;
  type: "input" | "textarea" | "number" | "select" | "switch" | "radio" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  defaultValue?: unknown;
}

export interface TaskTemplate {
  type: "INSPECTION" | "HOT_SUMMARY";
  name: string;
  description?: string;
  targetLevel: TargetLevel;
  supportImmediate: boolean;
  supportSchedule: boolean;
  configSchema?: TaskConfigField[];
}

export interface ScheduleConfig {
  type: "once" | "daily" | "weekly" | "cron";
  runAt?: string;
  time?: string;
  weekdays?: number[];
  cron?: string;
}

export interface ScheduledTask {
  id: string;
  name?: string;
  accountId: string;
  guildId?: string;
  channelId?: string;
  taskType: string;
  targetLevel: TargetLevel;
  rangeType: RangeType;
  sectionIds: string[];
  taskConfig: Record<string, unknown>;
  scheduleConfig: ScheduleConfig;
  status: "enabled" | "disabled" | "error";
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt?: string;
}

export interface ExecutionRecord {
  id: string;
  scheduledTaskId?: string;
  accountId: string;
  guildId?: string;
  channelId?: string;
  taskType: string;
  taskName?: string;
  targetLevel: TargetLevel;
  rangeType: RangeType;
  sectionIds: string[];
  executionMode: ExecutionMode;
  status: "pending" | "running" | "success" | "failed";
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  taskConfigSnapshot?: Record<string, unknown>;
  accountSnapshot: { qq: string; nickname?: string };
  channelSnapshot?: { channelId: string; name: string };
  sectionSnapshots?: Array<{ sectionId: string; name: string }>;
}

type AccountProfile = Record<string, { qq?: string; nickname?: string; remark?: string; deleted?: boolean }>;
type GuildWithChannels = GuildView & { channels?: ChannelView[] };

const PROFILE_KEY = "tcm_account_profiles";
const DISABLED_TASK_KEY = "tcm_disabled_task_ids";

export const taskTemplates: TaskTemplate[] = [
  {
    type: "INSPECTION",
    name: "频道巡查",
    description: "扫描频道帖子并生成风险记录。",
    targetLevel: "channel",
    supportImmediate: true,
    supportSchedule: true,
    configSchema: [{ key: "topN", label: "扫描上限", type: "number", defaultValue: 500 }],
  },
  {
    type: "HOT_SUMMARY",
    name: "每日热门",
    description: "统计频道当天热门帖子和话题。",
    targetLevel: "channel",
    supportImmediate: true,
    supportSchedule: true,
    configSchema: [{ key: "topN", label: "汇总数量", type: "number", defaultValue: 10 }],
  },
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function profiles() {
  return readJson<AccountProfile>(PROFILE_KEY, {});
}

function saveProfile(id: string, next: AccountProfile[string]) {
  const all = profiles();
  all[id] = { ...all[id], ...next };
  writeJson(PROFILE_KEY, all);
}

function mapTokenStatus(status: TokenView["status"]): AccountStatus {
  if (status === "ACTIVE") return "normal";
  if (status === "INVALID" || status === "REVOKED") return "expired";
  return "error";
}

function taskName(type: string) {
  return taskTemplates.find((t) => t.type === type)?.name ?? type;
}

function taskTargetLevel(type: string): TargetLevel {
  return taskTemplates.find((t) => t.type === type)?.targetLevel ?? "channel";
}

function runStatus(status: TaskRunView["status"]): ExecutionRecord["status"] {
  if (status === "SUCCESS") return "success";
  if (status === "FAILED" || status === "TIMEOUT") return "failed";
  if (status === "RUNNING") return "running";
  return "pending";
}

async function accountLookup() {
  const accounts = await accountService.getAccountList();
  return Object.fromEntries(accounts.map((a) => [a.id, a]));
}

async function channelLookup() {
  const guilds = await api.listGuilds();
  const pairs = guilds.map((g) => [g, channelsOf(g)] as const);
  const rows: Array<Channel & { guild: GuildView }> = [];
  for (const [guild, channels] of pairs) {
    for (const channel of channels) rows.push(mapChannel(guild, channel));
  }
  return Object.fromEntries(rows.map((c) => [c.id, c]));
}

function mapChannel(guild: GuildView, channel: ChannelView): ChannelWithGuild {
  return {
    id: channel.id,
    accountId: guild.tokenId,
    channelId: channel.channelId,
    name: channel.name,
    status: "normal",
    sectionCount: 0,
    lastRunAt: channel.cachedAt,
    guild,
  };
}

function mapGuild(guild: GuildView): ChannelWithGuild {
  return {
    id: guild.id,
    accountId: guild.tokenId,
    channelId: guild.guildId,
    name: guild.name,
    status: "normal",
    sectionCount: channelsOf(guild).length,
    lastRunAt: guild.cachedAt,
    guild,
  };
}

function channelsOf(guild: GuildView): ChannelView[] {
  return (guild as GuildWithChannels).channels ?? [];
}

function selectTargetSections(sections: Section[], taskConfig?: Record<string, unknown>) {
  if (taskConfig?.rangeType !== "selectedSections") return sections;
  const selectedIds = Array.isArray(taskConfig.sectionIds) ? taskConfig.sectionIds.map(String) : [];
  return sections.filter((section) => selectedIds.includes(section.id));
}

function taskSectionIds(task: TaskView) {
  const ids = Array.isArray(task.params.sectionIds) ? task.params.sectionIds.map(String) : [];
  return ids.length > 0 ? ids : task.channelId ? [task.channelId] : [];
}

export const accountService = {
  async getAccountList(): Promise<Account[]> {
    const [tokens, tasks] = await Promise.all([api.listTokens(), api.listTasks()]);
    const profileMap = profiles();
    const guildRows = await Promise.all(tokens.map((t) => api.listGuilds(t.id).catch(() => [] as GuildWithChannels[])));
    return tokens
      .filter((t) => !profileMap[t.id]?.deleted)
      .map((t, index) => {
        const profile = profileMap[t.id] ?? {};
        const channelCount = guildRows[index]?.length ?? 0;
        return {
          id: t.id,
          qq: profile.qq || `未填写-${index + 1}`,
          tokenTail: t.tokenTail,
          nickname: profile.nickname || t.label,
          remark: profile.remark,
          status: mapTokenStatus(t.status),
          channelCount,
          pendingTaskCount: tasks.filter((task) => task.tokenId === t.id && task.enabled).length,
          createdAt: t.createdAt,
        };
      });
  },
  async getAccountDetail(accountId: string) {
    return (await this.getAccountList()).find((a) => a.id === accountId) ?? null;
  },
  async createAccount(data: { qq: string; token: string; nickname?: string; remark?: string }) {
    const created = await api.createToken(data.nickname || data.qq, data.token);
    saveProfile(created.id, { qq: data.qq, nickname: data.nickname, remark: data.remark, deleted: false });
    await api.checkToken(created.id).catch(() => undefined);
    return created;
  },
  async updateAccount(accountId: string, data: { qq?: string; token?: string; nickname?: string; remark?: string }) {
    saveProfile(accountId, { qq: data.qq, nickname: data.nickname, remark: data.remark });
    const tokenPatch: { label?: string; secret?: string } = {};
    if (data.nickname !== undefined || data.qq !== undefined) tokenPatch.label = data.nickname || data.qq || "未命名账号";
    if (data.token) tokenPatch.secret = data.token;
    if (tokenPatch.label !== undefined || tokenPatch.secret !== undefined) await api.updateToken(accountId, tokenPatch);
    if (data.token) await api.checkToken(accountId);
  },
  async refreshAccountStatus(accountId: string) {
    return api.checkToken(accountId);
  },
  async checkAccountDeleteRisk(accountId: string) {
    const tasks = await api.listTasks();
    const running = await Promise.all(tasks.filter((t) => t.tokenId === accountId).map((t) => api.listRuns(t.id)));
    return {
      runningCount: running.flat().filter((r) => r.status === "RUNNING" || r.status === "PENDING").length,
      enabledScheduleCount: tasks.filter((t) => t.tokenId === accountId && t.enabled && t.scheduleMode === "DAILY").length,
    };
  },
  async deleteAccount(accountId: string) {
    saveProfile(accountId, { deleted: true });
  },
};

export const channelService = {
  async getChannelsByAccount(accountId: string): Promise<ChannelWithGuild[]> {
    const guilds = await api.listGuilds(accountId);
    return guilds.map(mapGuild);
  },
  async getChannelDetail(accountId: string, channelId: string) {
    return (await this.getChannelsByAccount(accountId)).find((c) => c.id === channelId || c.channelId === channelId) ?? null;
  },
  async refreshChannels(accountId: string) {
    await api.syncGuilds(accountId);
    const guilds = await api.listGuilds(accountId);
    const results = await Promise.all(guilds.map((guild) => api.syncChannels(guild.id).catch(() => ({ ok: false, count: 0 }))));
    return {
      ok: results.some((result) => result.ok),
      count: results.reduce((sum, result) => sum + result.count, 0),
    };
  },
  async getSectionsByChannel(accountId: string, channelId: string): Promise<Section[]> {
    const channel = await this.getChannelDetail(accountId, channelId);
    if (!channel) return [];
    const channels = await api.listChannels(channel.guild.id);
    return channels.map((c) => ({
      id: c.id,
      accountId,
      channelId: channel.id,
      sectionId: c.channelId,
      name: c.name,
      status: "normal",
    }));
  },
  async refreshSectionsByChannel(accountId: string, channelId: string) {
    const channel = await this.getChannelDetail(accountId, channelId);
    if (!channel) return { ok: false, count: 0 };
    return api.syncChannels(channel.guild.id);
  },
};

export const taskService = {
  async getTaskTemplates() {
    return taskTemplates;
  },
  async createScheduledTask(data: {
    taskType: "INSPECTION" | "HOT_SUMMARY";
    accountId: string;
    channelId: string;
    modelId?: string | null;
    scheduleConfig: ScheduleConfig;
    taskConfig?: Record<string, unknown>;
  }) {
    const channel = await channelService.getChannelDetail(data.accountId, data.channelId);
    if (!channel) throw new Error("请选择执行频道");
    if (data.taskType === "INSPECTION" && !data.modelId) throw new Error("请选择巡查模型");
    return api.createTask({
      type: data.taskType,
      tokenId: data.accountId,
      modelId: data.taskType === "INSPECTION" ? data.modelId ?? null : null,
      guildId: channel.id,
      channelId: null,
      scheduleMode: "DAILY",
      defaultTime: data.scheduleConfig.time ?? "23:30",
      params: data.taskConfig ?? {},
    });
  },
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    const disabled = readJson<string[]>(DISABLED_TASK_KEY, []);
    return (await api.listTasks())
      .filter((task) => task.scheduleMode === "DAILY")
      .map((task) => ({
        id: task.id,
        name: taskName(task.type),
        accountId: task.tokenId,
        guildId: task.guildId ?? undefined,
        channelId: task.channelId ?? undefined,
        taskType: task.type,
        targetLevel: taskTargetLevel(task.type),
        rangeType: "all",
        sectionIds: taskSectionIds(task),
        taskConfig: task.params,
        scheduleConfig: { type: "daily", time: task.defaultTime },
        status: disabled.includes(task.id) || !task.enabled || task.status === "PAUSED" ? "disabled" : "enabled",
        nextRunAt: `每天 ${task.defaultTime}`,
        createdAt: task.createdAt,
      }));
  },
  async getScheduledTask(id: string) {
    return (await this.getScheduledTasks()).find((t) => t.id === id) ?? null;
  },
  async updateScheduledTask(
    id: string,
    payload: { accountId?: string; scheduleConfig?: ScheduleConfig; taskConfig?: Record<string, unknown> } = {}
  ) {
    const body: {
      defaultTime?: string;
      scheduleMode?: "DAILY" | "IMMEDIATE";
      params?: Record<string, unknown>;
    } = {};
    if (payload.scheduleConfig?.time) {
      body.defaultTime = payload.scheduleConfig.time;
      body.scheduleMode = payload.scheduleConfig.type === "daily" ? "DAILY" : "IMMEDIATE";
    }
    if (payload.taskConfig) body.params = payload.taskConfig;
    return api.updateTask(id, body);
  },
  async enableScheduledTask(id: string) {
    writeJson(DISABLED_TASK_KEY, readJson<string[]>(DISABLED_TASK_KEY, []).filter((x) => x !== id));
  },
  async disableScheduledTask(id: string) {
    const ids = new Set(readJson<string[]>(DISABLED_TASK_KEY, []));
    ids.add(id);
    writeJson(DISABLED_TASK_KEY, Array.from(ids));
  },
  async deleteScheduledTask(id: string) {
    await this.disableScheduledTask(id);
  },
};

export const executionService = {
  async executeTaskImmediately(data: {
    taskType: "INSPECTION" | "HOT_SUMMARY";
    accountId: string;
    channelId: string;
    modelId?: string | null;
    taskConfig?: Record<string, unknown>;
  }) {
    const channel = await channelService.getChannelDetail(data.accountId, data.channelId);
    if (!channel) throw new Error("请选择执行频道");
    if (data.taskType === "INSPECTION" && !data.modelId) throw new Error("请选择巡查模型");
    return api.createTask({
      type: data.taskType,
      tokenId: data.accountId,
      modelId: data.taskType === "INSPECTION" ? data.modelId ?? null : null,
      guildId: channel.id,
      channelId: null,
      scheduleMode: "IMMEDIATE",
      defaultTime: "23:30",
      params: data.taskConfig ?? {},
    });
  },
  async getExecutionRecords(): Promise<ExecutionRecord[]> {
    const [tasks, accounts, channels] = await Promise.all([api.listTasks(), accountLookup(), channelLookup()]);
    const runs = await Promise.all(tasks.map(async (task) => [task, await api.listRuns(task.id)] as const));
    return runs.flatMap(([task, taskRuns]) =>
      taskRuns.map((run) => {
        const account = accounts[task.tokenId];
        const channel = task.channelId ? channels[task.channelId] : undefined;
        return {
          id: run.id,
          scheduledTaskId: task.id,
          accountId: task.tokenId,
          guildId: task.guildId ?? undefined,
          channelId: task.channelId ?? undefined,
          taskType: task.type,
          taskName: taskName(task.type),
          targetLevel: taskTargetLevel(task.type),
          rangeType: "all",
          sectionIds: taskSectionIds(task),
          executionMode: task.scheduleMode === "IMMEDIATE" ? "immediate" : "schedule",
          status: runStatus(run.status),
          startedAt: run.startedAt ?? run.createdAt,
          finishedAt: run.finishedAt ?? undefined,
          errorMessage: run.error ?? undefined,
          taskConfigSnapshot: task.params,
          accountSnapshot: { qq: account?.qq ?? "已删除账号", nickname: account?.nickname },
          channelSnapshot: channel ? { channelId: channel.channelId, name: channel.name } : undefined,
        } satisfies ExecutionRecord;
      }),
    );
  },
  async getExecutionRecord(id: string) {
    return (await this.getExecutionRecords()).find((r) => r.id === id) ?? null;
  },
};
