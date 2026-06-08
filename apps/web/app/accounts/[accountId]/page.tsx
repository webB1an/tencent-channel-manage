"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { SectionHeader, ChannelRow, EmptyState, InfoTile } from "@/components/patterns";
import { accountService, channelService, type Account, type Channel } from "@/lib/domain";
import { formatShortDate } from "@/lib/utils";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [a, cs] = await Promise.all([
        accountService.getAccountDetail(params.accountId),
        channelService.getChannelsByAccount(params.accountId).catch(() => [] as Channel[]),
      ]);
      setAccount(a);
      setChannels(cs);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [params.accountId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function syncChannels() {
    setRefreshing(true);
    try {
      const res = await channelService.refreshChannels(params.accountId);
      Toast.show({ content: `已刷新 ${res.count} 个频道`, type: "success" });
      await refresh();
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setRefreshing(false);
    }
  }

  async function onDelete() {
    setConfirmDelete(false);
    try {
      await accountService.deleteAccount(params.accountId);
      Toast.show({ content: "账号已删除", type: "success" });
      router.replace("/");
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="账号详情" />
        <main className="page-shell space-y-4">
          <Skeleton height={140} className="block rounded-lg" />
          <Skeleton height={48} className="block rounded" />
          <Skeleton height={80} className="block rounded-lg" />
          <Skeleton height={80} className="block rounded-lg" />
        </main>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <TopBar title="账号详情" />
        <main className="page-shell">
          <EmptyState icon="alert-circle" title="账号不存在" hint="可能已被删除" />
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="账号详情"
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多操作" }), label: "更多" }]}
      />

      <main className="page-shell space-y-5">
        {/* Account header card */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-[20px] font-display">
              {(account.nickname || account.qq).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-[18px] font-semibold text-ink">{account.nickname || "未命名账号"}</h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">QQ: {account.qq}</p>
            </div>
            <span className="rounded-sm border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success">
              {account.status === "normal" ? "NORMAL" : account.status === "expired" ? "EXPIRED" : "ERROR"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-ink-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>在线</span>
            <span className="ml-2 text-ink-faint">·</span>
            <span className="ml-2 font-mono text-[11px] text-ink-faint">tk_****{(account.tokenTail || "abcd").slice(-4)}</span>
          </div>

          <dl className="grid grid-cols-2 gap-2 border-t border-border pt-3">
            <InfoTile label="频道数" value={account.channelCount ?? 0} />
            <InfoTile label="待处理任务" value={account.pendingTaskCount ?? 0} emphasis={(account.pendingTaskCount ?? 0) > 0} />
            <InfoTile label="最后运行" value={account.lastRunAt ? formatShortDate(account.lastRunAt) : "—"} />
            <InfoTile label="备注" value={account.remark || "—"} />
          </dl>
        </Card>

        {/* Channel list */}
        <section>
          <SectionHeader
            title="频道列表"
            icon="list"
            count={`共 ${channels.length} 个`}
            action={
              <Button
                size="sm"
                variant="ghost"
                loading={refreshing}
                onClick={syncChannels}
                className="!h-8 text-[12px] text-primary"
              >
                <Icon name="refresh" size={14} className={refreshing ? "animate-spin" : ""} />
                刷新列表
              </Button>
            }
          />

          {channels.length === 0 ? (
            <EmptyState
              icon="megaphone"
              title="暂无频道"
              hint="请刷新频道或检查 Token 状态"
              action={
                <Button onClick={syncChannels}>
                  <Icon name="refresh" size={16} />
                  刷新频道
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {channels.map((c) => (
                <li key={c.id}>
                  <ChannelRow
                    name={c.name}
                    channelId={c.channelId}
                    accountId={c.accountId}
                    sectionCount={c.sectionCount}
                    taskCount={c.scheduledTaskCount}
                    status={(c.status as any) ?? "active"}
                    channelType="megaphone"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/accounts/${params.accountId}/edit`}>
            <Button block variant="secondary" size="lg">
              <Icon name="edit-2" size={16} />
              编辑账号
            </Button>
          </Link>
          <Button block variant="outlined" size="lg" onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={16} />
            删除账号
          </Button>
        </div>
      </main>

      <Dialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="删除账号"
        content="账号及其所有关联数据将被清除,且不可恢复。"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmDelete(false)}>
              取消
            </Button>
            <Button block variant="danger" onClick={onDelete}>
              确认删除
            </Button>
          </>
        }
      />
    </>
  );
}
