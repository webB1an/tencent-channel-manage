"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ChannelView, GuildView, ModelView, TaskRunView, TaskView, TokenView } from "@tcm/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Segmented } from "@/components/ui/Segmented";
import { TaskCard } from "@/components/patterns/TaskCard";
import { EmptyState } from "@/components/patterns/EmptyState";
import { cn } from "@/lib/utils";

type Kind = "INSPECTION" | "HOT_SUMMARY";
type Schedule = "IMMEDIATE" | "DAILY";

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
  const [scheduleMode, setScheduleMode] = useState<Schedule>("DAILY");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
  const canCreate = Boolean(tokenId && guildId && channelId && (kind !== "INSPECTION" || selectedModel));

  async function syncChannels() {
    if (!guildId) return;
    setBusy("sync-channels");
    setMessage(null);
    try {
      const res = await api.syncChannels(guildId);
      setMessage({ kind: "ok", text: `已同步 ${res.count} 个板块` });
      setChannels(await api.listChannels(guildId));
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
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
      setMessage({ kind: "ok", text: res.runId ? "任务已创建并开始执行" : "任务已创建" });
      await refresh();
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function trigger(id: string) {
    setBusy(id);
    setMessage(null);
    try {
      await api.runTask(id);
      await refresh();
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <h1 className="text-d2 text-ink">任务</h1>
        <p className="mt-1 text-body text-ink-2">配置你的自动化运营。</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      {message && (
        <p
          className={cn(
            "mt-5 rounded-md px-3 py-2 text-small",
            message.kind === "ok" ? "bg-lime text-lime-ink" : "bg-risk-high/10 text-risk-high",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="mt-7">
        <SectionTitle step="1" title="选择任务类型" />
        <div className="mt-3">
          <Segmented<Kind>
            value={kind}
            onChange={setKind}
            options={[
              { value: "INSPECTION", label: "频道巡检" },
              { value: "HOT_SUMMARY", label: "每日热门" },
            ]}
          />
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle step="2" title="关联频道" />
        <div className="mt-3 rounded-lg bg-paper-2 p-4 space-y-3">
          <Select value={tokenId} onChange={(e) => { setTokenId(e.target.value); setGuildId(""); setChannelId(""); }}>
            <option value="">选择 Token</option>
            {tokens.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.status}</option>)}
          </Select>
          <Select value={guildId} onChange={(e) => { setGuildId(e.target.value); setChannelId(""); }}>
            <option value="">选择频道</option>
            {guilds.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.role ?? "成员"}</option>)}
          </Select>
          <div className="flex gap-2">
            <Select className="flex-1" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
              <option value="">选择板块</option>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button variant="secondary" size="md" onClick={syncChannels} disabled={!guildId || busy === "sync-channels"} loading={busy === "sync-channels"}>
              同步
            </Button>
          </div>
        </div>
      </section>

      {kind === "INSPECTION" && (
        <section className="mt-6">
          <SectionTitle step="3" title="模型" />
          <div className="mt-3 rounded-md bg-paper-2 px-3 py-2 text-small text-ink-2">
            当前：{selectedModel ? selectedModel.model : "未配置"}
            {!selectedModel && <span className="ml-2 text-risk-mid">先去我的配置</span>}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle step={kind === "INSPECTION" ? "4" : "3"} title="执行计划" />
        <div className="mt-3">
          <Segmented<Schedule>
            value={scheduleMode}
            onChange={setScheduleMode}
            options={[
              { value: "IMMEDIATE", label: "立即执行" },
              { value: "DAILY", label: "每日 23:30" },
            ]}
          />
        </div>
        <p className="mt-3 text-mini text-ink-3 leading-relaxed">
          {kind === "INSPECTION" ? "扫描当天帖子，最多 500 条，已巡检帖子自动跳过。" : "统计上海时区当天发布的帖子，按当前点赞数取 Top 10。"}
        </p>
      </section>

      <div className="mt-7">
        <Button variant="primary" size="lg" fullWidth onClick={createTask} disabled={!canCreate} loading={busy === "create"}>
          {scheduleMode === "IMMEDIATE" ? "保存并执行" : "保存任务"}
        </Button>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">我的任务</h2>
          <span className="text-micro text-ink-3">· {tasks.length}</span>
        </div>
        {tasks.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="folder" title="还没有任务" hint="上面配置一个开始" />
          </div>
        ) : (
          <ul className="mt-3 space-y-3 stagger">
            {tasks.map((t) => (
              <li key={t.id}>
                <TaskCard task={t} lastRun={runsByTask[t.id]?.[0]} onTrigger={() => trigger(t.id)} busy={busy === t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SectionTitle({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-micro font-mono text-ink-3">{step}</span>
      <h3 className="text-h3 text-ink-2">{title}</h3>
    </div>
  );
}
