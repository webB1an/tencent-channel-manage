"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HotSummaryView, InspectionResultView } from "@tcm/shared";

export default function ResultsPage() {
  const [tab, setTab] = useState<"inspection" | "hot">("inspection");
  const [summaries, setSummaries] = useState<HotSummaryView[]>([]);
  const [inspections, setInspections] = useState<InspectionResultView[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [confirm, setConfirm] = useState<{ id: string; action: "delete_post" | "mute_author" } | null>(null);

  async function refresh() {
    const [ss, ii] = await Promise.all([api.listSummaries(date), api.listInspections()]);
    setSummaries(ss);
    setInspections(ii);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [date]);

  async function mark(id: string, status: "PROCESSED" | "IGNORED") {
    await api.updateInspection(id, status);
    await refresh();
  }

  async function doRiskAction() {
    if (!confirm) return;
    await api.riskAction(confirm.id, confirm.action, "mobile_confirmed");
    await mark(confirm.id, "PROCESSED");
    setConfirm(null);
  }

  return (
    <main className="px-5 pt-6">
      <header className="flex items-end justify-between">
        <h1 className="text-xl font-semibold text-ink">结果</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-ink" />
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow-card">
        <button onClick={() => setTab("inspection")} className={seg(tab === "inspection")}>巡检</button>
        <button onClick={() => setTab("hot")} className={seg(tab === "hot")}>热门</button>
      </div>

      {tab === "inspection" ? (
        <section className="mt-4 space-y-3">
          {inspections.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-soft">暂无巡检结果</p>
          ) : inspections.map((i) => (
            <article key={i.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className={riskClass(i.riskLevel)}>{i.riskLevel}</span>
                <span className="text-xs text-ink-soft">{i.status}</span>
              </div>
              <h2 className="mt-3 text-sm font-medium text-ink">{i.title || "未命名帖子"}</h2>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-ink-soft">{i.content || i.reason}</p>
              <p className="mt-2 text-xs text-ink-soft">作者：{i.authorName ?? "未知"} · 赞 {i.likeCount} · 评论 {i.commentCount}</p>
              <p className="mt-2 rounded-xl bg-paper px-3 py-2 text-xs leading-5 text-ink">{i.reason}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button onClick={() => mark(i.id, "IGNORED")} className="tap rounded-xl bg-paper py-2 text-xs text-ink">忽略</button>
                <button onClick={() => mark(i.id, "PROCESSED")} className="tap rounded-xl bg-brand-soft py-2 text-xs text-brand">已处理</button>
                <button onClick={() => setConfirm({ id: i.id, action: "delete_post" })} className="tap rounded-xl bg-rose-50 py-2 text-xs text-rose-500">删除</button>
                <button onClick={() => setConfirm({ id: i.id, action: "mute_author" })} className="tap rounded-xl bg-amber-50 py-2 text-xs text-amber-600">禁言</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          {summaries.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-soft">今天还没有生成热门汇总</p>
          ) : summaries.map((summary) => (
            <article key={summary.id} className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs text-ink-soft">{summary.date}</p>
              <ul className="mt-3 space-y-3">
                {(summary.items as Array<{ rank?: number; title?: string; content?: string; likeCount?: number; commentCount?: number; authorName?: string }>).map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " + (index < 3 ? "bg-brand text-white" : "bg-paper text-ink-soft")}>
                      {item.rank ?? index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.title || item.content || "未命名帖子"}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{item.authorName ?? "未知"} · 赞 {item.likeCount ?? 0} · 评论 {item.commentCount ?? 0}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      {confirm && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-white p-5">
            <h2 className="text-base font-semibold text-ink">{confirm.action === "delete_post" ? "确认删除这条帖子？" : "确认禁言作者？"}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">这是高风险操作。MVP 阶段会记录审计日志，正式执行能力后续接入 CLI 命令。</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirm(null)} className="tap rounded-xl bg-paper py-3 text-sm text-ink">取消</button>
              <button onClick={doRiskAction} className="tap rounded-xl bg-rose-500 py-3 text-sm text-white">确认</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function seg(active: boolean) {
  return "tap rounded-xl py-2 text-sm " + (active ? "bg-brand text-white" : "text-ink-soft");
}

function riskClass(level: string) {
  const base = "rounded-full px-2 py-0.5 text-[10px] ";
  if (level === "HIGH" || level === "CRITICAL") return base + "bg-rose-50 text-rose-600";
  if (level === "MEDIUM") return base + "bg-amber-50 text-amber-600";
  return base + "bg-emerald-50 text-emerald-600";
}
