"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { StatusBadge } from "@/components/patterns";
import { executionService, type ExecutionRecord } from "@/lib/domain";
import { formatShortDate } from "@/lib/utils";

export default function ExecutionRecordPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    executionService.getExecutionRecord(params.id)
      .then(setRecord)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!record) return <TopBar title="执行记录" />;

  const duration = record.startedAt && record.finishedAt
    ? `${Math.round((new Date(record.finishedAt).getTime() - new Date(record.startedAt).getTime()) / 1000)}s`
    : "—";

  return (
    <>
      <TopBar title={record.taskName || record.taskType} />
      <main className="page-shell space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{record.taskName || record.taskType}</h2>
              <p className="mt-1 text-sm text-text-2">{record.accountSnapshot.nickname || record.accountSnapshot.qq} · {record.channelSnapshot?.name || "全账号"}</p>
              <p className="mt-1 text-xs text-text-3">{formatShortDate(record.startedAt) || "暂无时间"}</p>
            </div>
            <StatusBadge status={record.status} />
          </div>
        </Card>
        <section className="overflow-hidden rounded-lg border border-border bg-bg-card">
          <ListRow title="状态" suffix={record.status} />
          <ListRow title="开始时间" suffix={formatShortDate(record.startedAt) || "—"} />
          <ListRow title="结束时间" suffix={formatShortDate(record.finishedAt) || "—"} />
          <ListRow title="耗时" suffix={duration} />
        </section>
      </main>
    </>
  );
}
