"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatLocalDate } from "@/lib/utils";
import type { HotSummaryView, InspectionResultView, TaskRunView, TaskView } from "@tcm/shared";
import { StatCard } from "@/components/patterns/StatCard";
import { RiskCardCompact } from "@/components/patterns/RiskCardCompact";
import { HotTopicItem } from "@/components/patterns/HotTopicItem";
import { EmptyState } from "@/components/patterns/EmptyState";

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

  const pending = inspections.filter((i) => i.status === "PENDING");
  const todayTopics = summaries[0]?.items as Array<{ title?: string; content?: string; likeCount?: number; commentCount?: number; authorName?: string }> | undefined;

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <p className="text-micro tracking-[0.08em] text-ink-3 font-mono">{formatLocalDate()}</p>
        <h1 className="mt-1.5 text-d2 text-ink">今日运营台</h1>
        <p className="mt-1 text-body text-ink-2">早上好，{typeof window !== "undefined" ? (localStorage.getItem("tcm_username") ?? "频道主") : "频道主"}。</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      <section className="mt-7 grid grid-cols-3 gap-2.5 stagger">
        <StatCard label="TASKS" value={tasks.length} hint="全部" />
        <StatCard label="RUNNING" value={running.length} hint="进行中" accent />
        <StatCard label="PENDING" value={pending.length} hint="待处理" />
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">待处理风险</h2>
          <span className="text-micro text-ink-3">· {pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="pulse" title="今天暂时没有待处理风险" />
          </div>
        ) : (
          <ul className="mt-3 space-y-2 stagger">
            {pending.slice(0, 3).map((i) => (
              <li key={i.id}>
                <RiskCardCompact inspection={i} />
              </li>
            ))}
          </ul>
        )}
        {pending.length > 0 && (
          <Link
            href="/results"
            className="mt-3 inline-flex items-center gap-1 text-small text-ink-2 hover:text-ink"
          >
            去处理 →
          </Link>
        )}
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">今日热门</h2>
          <span className="text-micro text-ink-3">· {todayTopics?.length ?? 0} 个话题</span>
        </div>
        {!todayTopics || todayTopics.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="inbox" title="今天还没有热门汇总" hint="去任务页跑一个试试" />
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-line bg-paper p-1.5">
            {todayTopics.slice(0, 3).map((t, idx) => (
              <HotTopicItem
                key={idx}
                rank={idx + 1}
                title={t.title ?? t.content ?? "未命名"}
                authorName={t.authorName}
                likeCount={t.likeCount}
                commentCount={t.commentCount}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9 grid grid-cols-2 gap-2.5">
        <Link
          href="/tasks"
          className="tap h-12 rounded-md border border-line bg-paper text-small text-ink inline-flex items-center justify-center hover:bg-paper-2"
        >
          管理任务 →
        </Link>
        <Link
          href="/results"
          className="tap h-12 rounded-md border border-line bg-paper text-small text-ink inline-flex items-center justify-center hover:bg-paper-2"
        >
          查看结果 →
        </Link>
      </section>
    </main>
  );
}
