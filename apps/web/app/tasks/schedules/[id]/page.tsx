"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { StatusBadge, SectionHeader, IconBadge } from "@/components/patterns";
import { accountService, channelService, taskService, type Account, type Channel, type ScheduledTask } from "@/lib/domain";
import { formatShortDate } from "@/lib/utils";

export default function ScheduleDetailPage({ params }: { params: { id: string } }) {
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService
      .getScheduledTask(params.id)
      .then(async (t) => {
        setTask(t);
        if (!t) return;
        if (t.channelId) {
          const [a, c] = await Promise.all([
            accountService.getAccountDetail(t.accountId).catch(() => null),
            channelService.getChannelDetail(t.accountId, t.channelId).catch(() => null),
          ]);
          setAccount(a);
          setChannel(c);
        } else {
          setAccount(await accountService.getAccountDetail(t.accountId).catch(() => null));
        }
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <>
        <TopBar title="任务详情" />
        <main className="page-shell space-y-4">
          <Skeleton height={120} className="block rounded-lg" />
          <Skeleton height={200} className="block rounded-lg" />
        </main>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <TopBar title="任务详情" />
        <main className="page-shell">
          <Card padding="md" className="text-center text-ink-muted">任务不存在或已删除</Card>
        </main>
      </>
    );
  }

  const accountLabel = account?.nickname || account?.qq || task.accountId;
  const channelLabel = channel?.name || (task.channelId ? task.channelId : "全账号");

  return (
    <>
      <TopBar
        title={task.name || task.taskType}
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多" }), label: "更多" }]}
      />

      <main className="page-shell space-y-5">
        <Card padding="md" className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <IconBadge icon="clock" tone="primary" size="lg" />
              <div>
                <h2 className="font-display text-[18px] font-semibold text-ink">{task.name || task.taskType}</h2>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {task.targetLevel === "account" ? "账号级" : "频道级"} · 下次运行 {task.nextRunAt || "立即"}
                </p>
              </div>
            </div>
            <StatusBadge status={task.status} />
          </div>
        </Card>

        <section>
          <SectionHeader title="配置信息" icon="settings" />
          <Card padding="none" className="overflow-hidden">
            <ListRow title="任务类型" suffix={task.taskType} />
            <ListRow title="执行账号" suffix={accountLabel} />
            <ListRow title="执行频道" suffix={channelLabel} />
            <ListRow title="执行范围" suffix={task.rangeType === "all" ? "全频道" : `${task.sectionIds.length} 个分区`} />
            <ListRow title="调度类型" suffix={task.scheduleConfig.type === "daily" ? "每天" : "单次"} />
            {task.scheduleConfig.time && <ListRow title="执行时间" suffix={task.scheduleConfig.time} />}
            <ListRow title="创建时间" suffix={formatShortDate(task.createdAt) || "—"} />
          </Card>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Link href={`/tasks/schedules/${task.id}/edit`}>
            <Button block variant="secondary" size="lg">
              <Icon name="edit-2" size={16} />
              编辑
            </Button>
          </Link>
          <Button
            block
            variant="outlined"
            size="lg"
            onClick={async () => {
              try {
                if (task.status === "enabled") {
                  await taskService.disableScheduledTask(task.id);
                  Toast.show({ content: "已停用" });
                } else {
                  await taskService.enableScheduledTask(task.id);
                  Toast.show({ content: "已启用" });
                }
                setTask({ ...task, status: task.status === "enabled" ? "disabled" : "enabled" });
              } catch (e) {
                Toast.show({ content: (e as Error).message, type: "error" });
              }
            }}
          >
            <Icon name={task.status === "enabled" ? "pause" : "play"} size={16} />
            {task.status === "enabled" ? "停用" : "启用"}
          </Button>
        </div>
      </main>
    </>
  );
}
