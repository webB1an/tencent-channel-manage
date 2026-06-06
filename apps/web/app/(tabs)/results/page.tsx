"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HotSummaryView, InspectionResultView } from "@tcm/shared";
import { Segmented } from "@/components/ui/Segmented";
import { Sheet } from "@/components/ui/Sheet";
import { RiskCard } from "@/components/patterns/RiskCard";
import { HotTopicItem } from "@/components/patterns/HotTopicItem";
import { EmptyState } from "@/components/patterns/EmptyState";

type Tab = "inspection" | "hot";

export default function ResultsPage() {
  const [tab, setTab] = useState<Tab>("inspection");
  const [summaries, setSummaries] = useState<HotSummaryView[]>([]);
  const [inspections, setInspections] = useState<InspectionResultView[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [confirm, setConfirm] = useState<{ id: string; action: "delete_post" | "mute_author" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [ss, ii] = await Promise.all([api.listSummaries(date), api.listInspections()]);
    setSummaries(ss);
    setInspections(ii);
  }

  useEffect(() => {
    refresh().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function mark(id: string, status: "PROCESSED" | "IGNORED") {
    await api.updateInspection(id, status);
    await refresh();
  }

  async function doRiskAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.riskAction(confirm.id, confirm.action, "mobile_confirmed");
      await mark(confirm.id, "PROCESSED");
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  const inspectionCount = inspections.length;
  const hotCount = summaries.reduce(
    (sum, s) => sum + ((s.items as unknown[])?.length ?? 0),
    0,
  );

  return (
    <main className="px-5 pt-8 pb-12">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-d2 text-ink">结果</h1>
          <div className="mt-5 h-px w-8 bg-ink" />
        </div>
        <div className="pb-2 flex items-center gap-2 text-micro text-ink-3 font-mono">
          <span>📅</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-line bg-paper px-2 py-1 text-micro text-ink font-mono outline-none focus:border-ink"
          />
        </div>
      </header>

      <div className="mt-7">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "inspection", label: "巡检", count: inspectionCount },
            { value: "hot", label: "热门", count: hotCount },
          ]}
        />
      </div>

      {tab === "inspection" ? (
        <section className="mt-5">
          {inspections.length === 0 ? (
            <div className="rounded-lg border border-line bg-paper">
              <EmptyState icon="pulse" title="暂无巡检结果" />
            </div>
          ) : (
            <ul className="space-y-3 stagger">
              {inspections.map((i) => (
                <li key={i.id}>
                  <RiskCard
                    inspection={i}
                    onIgnore={() => mark(i.id, "IGNORED")}
                    onProcessed={() => mark(i.id, "PROCESSED")}
                    onDelete={() => setConfirm({ id: i.id, action: "delete_post" })}
                    onMute={() => setConfirm({ id: i.id, action: "mute_author" })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-5">
          {summaries.length === 0 || hotCount === 0 ? (
            <div className="rounded-lg border border-line bg-paper">
              <EmptyState icon="inbox" title="今天还没有生成热门汇总" />
            </div>
          ) : (
            <ul className="space-y-3 stagger">
              {summaries.map((summary) => (
                <li key={summary.id} className="rounded-lg border border-line bg-paper p-4">
                  <p className="text-micro font-mono text-ink-3 tracking-[0.08em]">DATE · {summary.date}</p>
                  <div className="mt-2">
                    {((summary.items as Array<{ rank?: number; title?: string; content?: string; likeCount?: number; commentCount?: number; authorName?: string }>) ?? []).map((item, index) => (
                      <HotTopicItem
                        key={index}
                        rank={item.rank ?? index + 1}
                        title={item.title || item.content || "未命名帖子"}
                        authorName={item.authorName}
                        likeCount={item.likeCount}
                        commentCount={item.commentCount}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Sheet
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.action === "delete_post" ? "确认删除这条帖子？" : "确认禁言作者？"}
        description="这是高风险操作。MVP 阶段会记录审计日志，正式执行能力后续接入 CLI 命令。"
        primaryAction={{
          label: "确认",
          danger: true,
          loading: busy,
          onClick: doRiskAction,
        }}
        secondaryAction={{
          label: "取消",
          onClick: () => setConfirm(null),
        }}
      />
    </main>
  );
}
