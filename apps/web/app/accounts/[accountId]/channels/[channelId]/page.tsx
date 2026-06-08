"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/top-bar";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader, SectionRow, EmptyState, StatTile } from "@/components/patterns";
import {
  accountService,
  channelService,
  executionService,
  taskService,
  type Account,
  type Channel,
  type ExecutionRecord,
  type ScheduledTask,
  type Section,
} from "@/lib/domain";
import { formatShortDate } from "@/lib/utils";

const sectionIcon: Record<string, "megaphone" | "share" | "message-circle" | "book" | "file-text" | "users"> = {
  公告: "megaphone",
  攻略分享: "share",
  闲聊灌水: "message-circle",
};

export default function ChannelDetailPage({ params }: { params: { accountId: string; channelId: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountService.getAccountDetail(params.accountId).catch(() => null),
      channelService.getChannelDetail(params.accountId, params.channelId).catch(() => null),
      channelService.getSectionsByChannel(params.accountId, params.channelId).catch(() => [] as Section[]),
      taskService.getScheduledTasks().catch(() => [] as ScheduledTask[]),
      executionService.getExecutionRecords().catch(() => [] as ExecutionRecord[]),
    ])
      .then(([a, c, s, t, r]) => {
        setAccount(a);
        setChannel(c);
        setSections(s);
        setTasks(t);
        setRecords(r);
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.accountId, params.channelId]);

  if (loading) {
    return (
      <>
        <TopBar title="频道详情" />
        <main className="page-shell space-y-4">
          <Skeleton height={140} className="block rounded-lg" />
          <Skeleton height={48} className="block rounded" />
          <Skeleton height={64} className="block rounded-lg" />
          <Skeleton height={120} className="block rounded-lg" />
        </main>
      </>
    );
  }

  if (!channel) {
    return (
      <>
        <TopBar title="频道详情" />
        <main className="page-shell">
          <EmptyState icon="alert-circle" title="频道不存在" hint="可能已被删除" />
        </main>
      </>
    );
  }

  const sectionIdSet = new Set(sections.map((s) => s.id));
  const channelTasks = tasks.filter((t) => t.accountId === params.accountId && t.sectionIds.some((id) => sectionIdSet.has(id)));
  const activeTasks = channelTasks.filter((t) => t.status === "enabled").length;
  const channelRecords = records
    .filter((r) => r.accountId === params.accountId && r.sectionIds.some((id) => sectionIdSet.has(id)))
    .slice()
    .sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime());
  const failedRecords = channelRecords.filter((r) => r.status === "failed").length;
  const recentRecords = channelRecords.slice(0, 5);

  return (
    <>
      <TopBar
        title="频道详情"
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多操作" }), label: "更多" }]}
      />

      <main className="page-shell space-y-5">
        {/* Channel header card */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Channel Name</p>
              <h2 className="mt-1 font-display text-[18px] font-semibold text-ink">{channel.name}</h2>
            </div>
            <span className="rounded-sm border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success">
              ● Normal
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-[12px]">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-faint">ID</dt>
              <dd className="mt-0.5 font-mono text-ink">CH_{channel.channelId}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-ink-faint">Belonging Account</dt>
              <dd className="mt-0.5">
                {account ? (
                  <Link href={`/accounts/${account.id}`} className="text-primary hover:underline">
                    {account.nickname || account.qq}
                  </Link>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Section list */}
        <section>
          <SectionHeader
            title="板块列表"
            icon="list"
            count={`${sections.length} 个`}
            action={
              <button
                className="flex h-8 items-center gap-1 text-[12px] text-primary u-press hover:bg-primary-soft rounded px-2"
                onClick={() => Toast.show({ content: "刷新板块" })}
              >
                <Icon name="refresh" size={14} />
                刷新
              </button>
            }
          />
          {sections.length === 0 ? (
            <EmptyState icon="list" title="还没有板块" hint="请刷新后查看" />
          ) : (
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <SectionRow
                    name={s.name}
                    icon={sectionIcon[s.name] ?? "file-text"}
                    onClick={() => Toast.show({ content: s.name })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Task overview */}
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[14px] font-semibold text-ink">任务概览</h3>
            <span className="rounded-sm border border-info/30 bg-info-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-info">
              Real-time
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <StatTile label="启用任务" value={activeTasks} icon="zap" tone="primary" />
            <StatTile label="失败记录" value={failedRecords} icon="alert-triangle" tone={failedRecords > 0 ? "danger" : "success"} />
          </div>
          <Link
            href={`/tasks?channel=${channel.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded border border-primary/20 bg-primary-soft py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Icon name="calendar" size={14} />
            查看相关定时任务
            <Icon name="arrow-up-right" size={12} />
          </Link>
        </Card>

        {/* Recent records */}
        <section>
          <SectionHeader title="最近执行记录" icon="activity" />
          {recentRecords.length === 0 ? (
            <EmptyState icon="activity" title="暂无执行记录" hint="执行任务后会在这里显示" />
          ) : (
            <>
              <Card padding="none" className="divide-y divide-border overflow-hidden">
                {recentRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">{r.taskName || r.taskType}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                        {formatShortDate(r.startedAt)} · ReqID: {r.id}
                      </p>
                    </div>
                    <span
                      className={
                        r.status === "success"
                          ? "rounded-sm border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success"
                          : r.status === "failed"
                            ? "rounded-sm border border-danger/30 bg-danger-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-danger"
                            : "rounded-sm border border-warning/30 bg-warning-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-warning"
                      }
                    >
                      {r.status === "success" ? "成功" : r.status === "failed" ? "失败" : r.status === "running" ? "运行中" : "等待中"}
                    </span>
                  </div>
                ))}
              </Card>
              <div className="mt-3 text-center">
                <Link
                  href={`/tasks?channel=${channel.id}`}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                >
                  查看全部记录
                  <Icon name="arrow-right" size={12} />
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
