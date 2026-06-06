"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { StatusBadge } from "@/components/patterns";
import { accountService, channelService, type Account, type Channel, taskService, type ScheduledTask } from "@/lib/domain";

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService.getScheduledTask(params.id)
      .then(async (t) => {
        setTask(t);
        if (!t) return;
        const [a] = await Promise.all([accountService.getAccountDetail(t.accountId)]);
        setAccount(a);
        if (t.channelId) {
          const c = await channelService.getChannelDetail(t.accountId, t.channelId);
          setChannel(c);
        }
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!task) return <TopBar title="任务详情" />;

  const accountLabel = account?.nickname || account?.qq || task.accountId;
  const channelLabel = channel?.name || (task.channelId ? task.channelId : "全账号");

  return (
    <>
      <TopBar title={task.name || task.taskType} />
      <main className="page-shell space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{task.name || task.taskType}</h2>
              <p className="mt-1 text-sm text-text-2">{task.targetLevel === "account" ? "账号级" : "频道级"} · 下次运行 {task.nextRunAt || "立即"}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>
        </Card>
        <section className="overflow-hidden rounded-lg border border-border bg-bg-card">
          <ListRow title="任务类型" suffix={task.taskType} />
          <ListRow title="执行账号" suffix={accountLabel} />
          <ListRow title="执行频道" suffix={channelLabel} />
          <ListRow title="创建时间" suffix={task.createdAt || "—"} />
        </section>
      </main>
    </>
  );
}
