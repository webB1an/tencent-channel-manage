"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ChannelView, GuildView, ModelView, TaskRunView, TaskView, TokenView } from "@tcm/shared";

type Kind = "INSPECTION" | "HOT_SUMMARY";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [runsByTask, setRunsByTask] = useState<Record<string, TaskRunView[]>>({});
  const [tokens, setTokens] = useState<TokenView[]>([]);
  const [models, setModels] = useState<ModelView[]>([]);
  const [guilds, setGuilds] = useState<Array<GuildView & { channels?: ChannelView[] }>>([]);
  const [channels, setChannels] = useState<ChannelView[]>([]);
  const [kind, setKind] = useState<Kind>("INSPECTION");
  const [tokenId, setTokenId] = useState("");
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"IMMEDIATE" | "DAILY">("DAILY");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const [ts, tk, ms] = await Promise.all([api.listTasks(), api.listTokens(), api.listModels()]);
    setTasks(ts);
    setTokens(tk);
    setModels(ms);
    const map: Record<string, TaskRunView[]> = {};
    await Promise.all(ts.map(async (t) => { map[t.id] = await api.listRuns(t.id); }));
    setRunsByTask(map);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  useEffect(() => {
    if (!tokenId) return;
    api.listGuilds(tokenId).then(setGuilds).catch(console.error);
  }, [tokenId]);

  useEffect(() => {
    if (!guildId) return;
    api.listChannels(guildId).then(setChannels).catch(console.error);
  }, [guildId]);

  const selectedModel = useMemo(() => models[0], [models]);
  const canCreate = tokenId && guildId && channelId && (kind !== "INSPECTION" || selectedModel);

  async function syncChannels() {
    if (!guildId) return;
    setBusy("sync-channels");
    try {
      const res = await api.syncChannels(guildId);
      setMessage(`已同步 ${res.count} 个板块`);
      setChannels(await api.listChannels(guildId));
    } finally {
      setBusy(null);
    }
  }

  async function createTask() {
    if (!canCreate) return;
    setBusy("create");
    setMessage(null);
    try {
      const res = await api.createTask({
        type: kind,
        tokenId,
        guildId,
        channelId,
        modelId: kind === "INSPECTION" ? selectedModel!.id : null,
        scheduleMode,
        defaultTime: "23:30",
      });
      setMessage(res.runId ? "任务已创建并开始执行" : "任务已创建");
      await refresh();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function trigger(id: string) {
    setBusy(id);
    try {
      await api.runTask(id);
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <h1 className="text-xl font-semibold text-ink">任务</h1>
      </header>
      {message && <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">{message}</p>}

      <section className="mt-5 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-medium text-ink">新建任务</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setKind("INSPECTION")} className={choice(kind === "INSPECTION")}>频道巡检</button>
          <button onClick={() => setKind("HOT_SUMMARY")} className={choice(kind === "HOT_SUMMARY")}>每日热门</button>
        </div>

        {kind === "INSPECTION" && !selectedModel && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">巡检需要先在“我的”配置模型。</p>
        )}

        <div className="mt-4 space-y-3">
          <select className="input" value={tokenId} onChange={(e) => { setTokenId(e.target.value); setGuildId(""); setChannelId(""); }}>
            <option value="">选择 Token</option>
            {tokens.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.status}</option>)}
          </select>

          <select className="input" value={guildId} onChange={(e) => { setGuildId(e.target.value); setChannelId(""); }}>
            <option value="">选择频道</option>
            {guilds.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.role ?? "成员"}</option>)}
          </select>

          <div className="flex gap-2">
            <select className="input flex-1" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
              <option value="">选择板块</option>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={syncChannels} disabled={!guildId || busy === "sync-channels"} className="tap rounded-xl bg-paper px-3 text-sm text-ink disabled:opacity-50">
              同步
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setScheduleMode("IMMEDIATE")} className={choice(scheduleMode === "IMMEDIATE")}>立即执行</button>
            <button onClick={() => setScheduleMode("DAILY")} className={choice(scheduleMode === "DAILY")}>每日 23:30</button>
          </div>

          <p className="text-xs leading-5 text-ink-soft">
            {kind === "INSPECTION" ? "扫描当天帖子，最多 500 条，已巡检帖子自动跳过。" : "统计上海时区当天发布的帖子，按当前点赞数取 Top 10。"}
          </p>

          <button disabled={!canCreate || busy === "create"} onClick={createTask} className="tap w-full rounded-xl bg-brand py-3 text-sm text-white disabled:opacity-50">
            {busy === "create" ? "创建中..." : scheduleMode === "IMMEDIATE" ? "保存并执行" : "保存任务"}
          </button>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-ink-soft">我的任务</h2>
        <ul className="mt-3 space-y-3">
          {tasks.map((t) => {
            const last = runsByTask[t.id]?.[0];
            return (
              <li key={t.id} className="rounded-2xl bg-white p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-medium text-ink">{t.type === "INSPECTION" ? "频道巡检" : "每日热门"}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">{t.scheduleMode === "DAILY" ? `每日 · ${t.defaultTime}` : "立即任务"} · {t.enabled ? "启用" : "停用"}</p>
                  </div>
                  <button onClick={() => trigger(t.id)} disabled={busy === t.id} className="tap rounded-full bg-brand-soft px-3 py-1.5 text-xs text-brand disabled:opacity-60">
                    {busy === t.id ? "排队中..." : "运行一次"}
                  </button>
                </div>
                {last && <p className="mt-3 text-xs text-ink-soft">最近：{last.status} · {new Date(last.createdAt).toLocaleString()}</p>}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function choice(active: boolean) {
  return "tap rounded-xl px-3 py-2.5 text-sm " + (active ? "bg-brand text-white" : "bg-paper text-ink");
}
