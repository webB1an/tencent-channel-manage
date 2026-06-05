"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HotSummaryView, InspectionResultView, TaskRunView, TaskView } from "@tcm/shared";

export default function HomePage() {
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [summaries, setSummaries] = useState<HotSummaryView[]>([]);
  const [inspections, setInspections] = useState<InspectionResultView[]>([]);
  const [running, setRunning] = useState<TaskRunView[]>([]);

  useEffect(() => {
    (async () => {
      const ts = await api.listTasks();
      setTasks(ts);
      const ss = await api.listSummaries();
      setSummaries(ss);
      setInspections(await api.listInspections());
      const all = await Promise.all(ts.map((t) => api.listRuns(t.id)));
      setRunning(all.flat().filter((r) => r.status === "RUNNING" || r.status === "PENDING"));
    })().catch(console.error);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-soft">{today}</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">今日运营台</h1>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-xs text-brand">在线</span>
      </header>

      <section className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="任务" value={String(tasks.length)} />
        <Stat label="运行中" value={String(running.length)} accent />
        <Stat label="待处理" value={String(inspections.filter((i) => i.status === "PENDING").length)} />
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">待处理风险</h2>
          <a href="/results" className="text-xs text-brand">去处理</a>
        </div>
        {inspections.filter((i) => i.status === "PENDING").length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">今天暂时没有待处理风险</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {inspections.filter((i) => i.status === "PENDING").slice(0, 3).map((i) => (
              <li key={i.id} className="rounded-xl bg-paper p-3 text-sm text-ink">
                <p className="font-medium">{i.title || "未命名帖子"}</p>
                <p className="mt-1 text-xs text-ink-soft">{i.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-medium text-ink">今日热门摘要</h2>
        {summaries.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            还没有数据，先去 <a className="text-brand" href="/tasks">任务</a> 跑一个试试。
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {summaries.map((s) => (
              <li key={s.id} className="rounded-xl bg-paper p-3 text-sm leading-6 text-ink">
                {summarizeText(s)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-medium text-ink">快速操作</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href="/tasks" className="tap rounded-xl bg-brand-soft px-3 py-3 text-center text-sm text-brand">
            管理任务
          </a>
          <a href="/results" className="tap rounded-xl bg-paper px-3 py-3 text-center text-sm text-ink">
            查看结果
          </a>
        </div>
      </section>
    </main>
  );
}

function summarizeText(s: HotSummaryView): string {
  const items = s.items as Array<{ title?: string; content?: string; likeCount?: number }>;
  if (!items?.length) return "今日暂无热门话题";
  return items
    .slice(0, 3)
    .map((i, index) => `Top${index + 1} ${i.title ?? i.content ?? "未命名"} · ${i.likeCount ?? 0}赞`)
    .join("  ·  ");
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"rounded-2xl p-3 shadow-card " + (accent ? "bg-brand text-white" : "bg-white")}>
      <p className={"text-xs " + (accent ? "text-white/80" : "text-ink-soft")}>{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none">{value}</p>
    </div>
  );
}
