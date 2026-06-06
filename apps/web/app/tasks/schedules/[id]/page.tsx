"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Dialog, Skeleton, Toast } from "antd-mobile";
import { executionService, taskService, type ExecutionRecord, type ScheduledTask } from "@/lib/domain";
import { BottomActionBar, EmptyPanel, ExecutionRecordCard, PageHeader, StatusTag } from "@/components/business/Mobile";

export default function ScheduleDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, allRecords] = await Promise.all([
        taskService.getScheduledTaskDetail(params.id),
        executionService.getExecutionRecords(),
      ]);
      setTask(detail);
      setRecords(allRecords.filter((r) => r.scheduledTaskId === params.id).slice(0, 5));
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function disableTask() {
    const ok = await Dialog.confirm({ content: "停用后该任务将不再自动执行，历史执行记录仍会保留。确定停用？" });
    if (!ok) return;
    await taskService.disableScheduledTask(params.id);
    Toast.show({ content: "任务已停用" });
    await refresh();
  }

  async function deleteTask() {
    const ok = await Dialog.confirm({ title: "删除定时任务", content: "删除后将永久移除该定时任务，但历史执行记录仍会保留。确定删除？" });
    if (!ok) return;
    await taskService.deleteScheduledTask(params.id);
    Toast.show({ content: "任务已删除" });
    await refresh();
  }

  return (
    <main className="page-pad pb-28">
      <PageHeader title="定时任务详情" backHref="/tasks" />
      {loading ? <Skeleton.Paragraph lineCount={8} animated /> : !task ? <EmptyPanel title="任务不存在" /> : (
        <>
          <Card className="adm-card-mobile">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-h2 text-ink">{task.name || task.taskType}</h2>
              <StatusTag status={task.status} />
            </div>
            <div className="mt-3 space-y-1 text-small text-ink-2">
              <p>类型：{task.taskType}</p>
              <p>账号：{task.accountId}</p>
              <p>频道：{task.channelId || "全账号"}</p>
              <p>范围：{task.rangeType === "all" ? "全部" : "指定板块"}</p>
              <p>规则：{task.scheduleConfig.type === "daily" ? `每天 ${task.scheduleConfig.time}` : "单次执行"}</p>
              <p>下次执行：{task.nextRunAt || "暂无"}</p>
            </div>
          </Card>

          <section className="mt-5">
            <h2 className="mb-3 text-h2 text-ink">最近执行记录</h2>
            {records.length === 0 ? <EmptyPanel title="暂无执行记录" /> : (
              <ul className="space-y-3">{records.map((record) => <li key={record.id}><ExecutionRecordCard record={record} /></li>)}</ul>
            )}
          </section>

          <BottomActionBar>
            <div className="grid grid-cols-3 gap-2">
              <Link href={`/tasks/schedules/${params.id}/edit`} className="block"><Button block size="large">编辑</Button></Link>
              <Button block size="large" color="warning" onClick={disableTask}>停用</Button>
              <Button block size="large" color="danger" onClick={deleteTask}>删除</Button>
            </div>
          </BottomActionBar>
        </>
      )}
    </main>
  );
}
