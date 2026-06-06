"use client";

import { useEffect, useState } from "react";
import { Card, Skeleton, Toast } from "antd-mobile";
import { executionService, type ExecutionRecord } from "@/lib/domain";
import { EmptyPanel, PageHeader, StatusTag } from "@/components/business/Mobile";

export default function ExecutionRecordDetailPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    executionService.getExecutionRecordDetail(params.id)
      .then(setRecord)
      .catch((e) => Toast.show({ content: (e as Error).message }))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <main className="page-pad">
      <PageHeader title="执行记录详情" backHref="/tasks" />
      {loading ? <Skeleton.Paragraph lineCount={8} animated /> : !record ? <EmptyPanel title="执行记录不存在" /> : (
        <div className="space-y-4">
          <Card className="adm-card-mobile">
            <div className="flex items-center justify-between">
              <h2 className="text-h2 text-ink">{record.taskName || record.taskType}</h2>
              <StatusTag status={record.status} />
            </div>
            <div className="mt-3 space-y-1 text-small text-ink-2">
              <p>方式：{record.executionMode === "immediate" ? "立即执行" : "定时执行"}</p>
              <p>开始：{record.startedAt || "暂无"}</p>
              <p>结束：{record.finishedAt || "暂无"}</p>
            </div>
          </Card>
          <Card className="adm-card-mobile">
            <h3 className="mb-2 text-h3 text-ink">执行对象</h3>
            <div className="space-y-1 text-small text-ink-2">
              <p>账号：{record.accountSnapshot.nickname || record.accountSnapshot.qq}</p>
              <p>QQ：{record.accountSnapshot.qq}</p>
              <p>频道：{record.channelSnapshot?.name || "全账号"}</p>
              <p>范围：{record.rangeType === "all" ? "全部" : "指定板块"}</p>
            </div>
          </Card>
          {record.errorMessage && (
            <Card className="adm-card-mobile">
              <h3 className="mb-2 text-h3 text-risk-high">错误信息</h3>
              <p className="text-small text-ink-2">{record.errorMessage}</p>
            </Card>
          )}
          <Card className="adm-card-mobile">
            <h3 className="mb-2 text-h3 text-ink">任务参数</h3>
            <pre className="max-h-52 overflow-auto rounded-md bg-paper p-3 text-mini text-ink-2">{JSON.stringify(record.taskConfigSnapshot ?? {}, null, 2)}</pre>
          </Card>
        </div>
      )}
    </main>
  );
}

