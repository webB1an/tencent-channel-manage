"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { TopBar } from "@/components/layout/top-bar";
import { StatusBadge, TokenText, ChannelCard, EmptyState } from "@/components/patterns";
import { accountService, channelService, type Account, type Channel } from "@/lib/domain";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [a, cs] = await Promise.all([
        accountService.getAccountDetail(params.accountId),
        channelService.getChannelsByAccount(params.accountId),
      ]);
      setAccount(a);
      setChannels(cs);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [params.accountId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function syncChannels() {
    setBusy(true);
    try {
      const res = await channelService.refreshChannels(params.accountId);
      Toast.show({ content: `已刷新 ${res.count} 个频道`, type: "success" });
      await refresh();
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
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

  return (
    <>
      <TopBar
        title="账号详情"
        right={
          account && (
            <Link href={`/accounts/${params.accountId}/edit`} className="text-md text-text-2">编辑</Link>
          )
        }
      />
      <main className="page-shell space-y-4">
        {loading ? (
          <Skeleton height={120} className="block" />
        ) : !account ? (
          <EmptyState title="账号不存在" hint="可能已被删除" />
        ) : (
          <>
            <section className="rounded-lg border border-border bg-bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-text-3">QQ：{account.qq}</p>
                  <h2 className="mt-1 text-2xl text-text">{account.nickname || "未命名账号"}</h2>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <div className="mt-3 space-y-1 text-sm text-text-2">
                <p>Token：<TokenText tail={account.tokenTail} /></p>
                <p>最近运行：{account.lastRunAt || "暂无"}</p>
                {account.remark && <p>备注：{account.remark}</p>}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg text-text">频道列表</h3>
                <Button size="sm" variant="ghost" loading={busy} onClick={syncChannels}>刷新频道</Button>
              </div>
              {channels.length === 0 ? (
                <EmptyState title="暂无频道" hint="请刷新频道或检查 Token 状态" action={<Button onClick={syncChannels}>刷新频道</Button>} />
              ) : (
                <ul className="space-y-3">{channels.map((c) => <li key={c.id}><ChannelCard channel={c} /></li>)}</ul>
              )}
            </section>

            <section className="pt-6">
              <Button block variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)}>删除账号</Button>
            </section>
          </>
        )}
      </main>

      <Dialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="删除账号"
        content="账号及其所有关联数据将被清除,且不可恢复。"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmDelete(false)}>取消</Button>
            <Button block variant="danger" onClick={onDelete}>确认删除</Button>
          </>
        }
      />
    </>
  );
}
