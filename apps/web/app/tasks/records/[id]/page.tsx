"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { SectionHeader, StatusBadge, IconBadge } from "@/components/patterns";
import { ListRow } from "@/components/ui/list-row";
import { executionService, type ExecutionRecord } from "@/lib/domain";
import { formatShortDate } from "@/lib/utils";

export default function ExecutionRecordPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    executionService
      .getExecutionRecord(params.id)
      .then(setRecord)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <>
        <TopBar title="记录详情" />
        <main className="page-shell space-y-4">
          <Skeleton height={120} className="block rounded-lg" />
          <Skeleton height={200} className="block rounded-lg" />
        </main>
      </>
    );
  }

  if (!record) {
    return (
      <>
        <TopBar title="记录详情" />
        <main className="page-shell">
          <Card padding="md" className="text-center text-ink-muted">记录不存在</Card>
        </main>
      </>
    );
  }

  const duration =
    record.startedAt && record.finishedAt
      ? `${Math.round((new Date(record.finishedAt).getTime() - new Date(record.startedAt).getTime()) / 1000)}s`
      : "—";

  return (
    <>
      <TopBar
        title="记录详情"
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多" }), label: "更多" }]}
      />

      <main className="page-shell space-y-5">
        {/* Status header card */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg " +
                  (record.status === "failed" ? "bg-danger-soft text-danger" : "bg-success-soft text-success")
                }
              >
                <Icon name={record.status === "failed" ? "alert-circle" : "check-circle"} size={20} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  {record.status === "failed" ? "Execution Failed" : "Execution Succeeded"}
                </p>
                <h2 className="mt-0.5 font-display text-[16px] font-semibold text-ink">{record.taskName || record.taskType}</h2>
              </div>
            </div>
            <StatusBadge status={record.status} />
          </div>
        </Card>

        {/* Meta */}
        <section>
          <SectionHeader title="Execution Object" icon="info" />
          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-[18px]">
                {(record.accountSnapshot.nickname || record.accountSnapshot.qq).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[14px] font-semibold text-ink">
                  {record.accountSnapshot.nickname || record.accountSnapshot.qq}
                </h3>
                <p className="font-mono text-[11px] text-ink-muted">Token ID: {record.accountId.slice(0, 8)}</p>
              </div>
              {record.channelSnapshot && (
                <span className="rounded-sm border border-info/30 bg-info-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-info">
                  Channel
                </span>
              )}
            </div>
            {record.channelSnapshot && (
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-[12px]">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-faint">Channel</p>
                  <p className="mt-0.5 font-medium text-ink">{record.channelSnapshot.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ink-faint">Scope</p>
                  <p className="mt-0.5 font-medium text-ink">
                    {record.rangeType === "all" ? "Full Channel" : `${record.sectionIds.length} sections`}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Error */}
        {record.status === "failed" && record.errorMessage && (
          <section>
            <SectionHeader title="Error Info" icon="alert-triangle" />
            <Card padding="md" className="border-danger/30 bg-danger-soft/40">
              <div className="flex items-start gap-2 text-danger">
                <Icon name="alert-circle" size={16} className="mt-0.5 flex-shrink-0" />
                <p className="font-mono text-[12px] font-semibold">ERR_CONNECTION_REFUSED</p>
              </div>
              <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-danger">
{record.errorMessage}
              </pre>
            </Card>
          </section>
        )}

        {/* Parameters */}
        <section>
          <SectionHeader title="Task Parameters" icon="settings" action={<span className="text-[12px] font-medium text-primary">View Raw JSON</span>} />
          <Card padding="none" className="overflow-hidden">
            <ListRow title="Retry Limit" suffix="3 Times" />
            <ListRow title="Concurrency" suffix="High (5 Threads)" />
            <ListRow title="Timeout Policy" suffix="Aggressive (15s)" />
            <ListRow title="Data Retention" suffix="Keep 30 Days" />
          </Card>
        </section>

        {/* Timing */}
        <section>
          <SectionHeader title="Execution Time" icon="clock" />
          <Card padding="md" className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Start Time</span>
              <span className="font-mono text-ink">{formatShortDate(record.startedAt) || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">End Time</span>
              <span className="font-mono text-ink">{formatShortDate(record.finishedAt) || "—"}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-ink-muted">Duration</span>
              <span className="font-mono font-medium text-primary">{duration}</span>
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button block variant="secondary" size="lg" onClick={() => Toast.show({ content: "重试已触发" })}>
            <Icon name="refresh" size={16} />
            重试任务
          </Button>
          <Link href={`/tasks/new?type=${record.taskType}`}>
            <Button block variant="primary" size="lg" className="w-full">
              <Icon name="edit-2" size={16} />
              编辑配置
            </Button>
          </Link>
        </div>
      </main>
    </>
  );
}
