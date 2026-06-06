"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, Skeleton, Toast } from "antd-mobile";
import { accountService, channelService, type Account, type Channel } from "@/lib/domain";
import { ChannelCard, EmptyPanel, PageHeader, StatusTag, TokenText } from "@/components/business/Mobile";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

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
      Toast.show({ content: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [params.accountId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function syncChannels() {
    setBusy(true);
    try {
      const res = await channelService.refreshChannels(params.accountId);
      Toast.show({ content: `已刷新 ${res.count} 个频道` });
      await refresh();
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad">
      <PageHeader title="账号详情" backHref="/" action={<Link href={`/accounts/${params.accountId}/edit`}><Button size="small" fill="none">编辑</Button></Link>} />
      {loading ? (
        <Skeleton.Paragraph lineCount={8} animated />
      ) : !account ? (
        <EmptyPanel title="账号不存在" hint="可能已被删除" />
      ) : (
        <>
          <Card className="adm-card-mobile">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-mini text-ink-3">QQ：{account.qq}</p>
                <h2 className="mt-1 text-h2 text-ink">{account.nickname || "未命名账号"}</h2>
              </div>
              <StatusTag status={account.status} />
            </div>
            <div className="mt-3 space-y-1 text-small text-ink-2">
              <p>Token：<TokenText tail={account.tokenTail} /></p>
              <p>最近运行：{account.lastRunAt || "暂无"}</p>
              {account.remark && <p>备注：{account.remark}</p>}
            </div>
          </Card>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h2 text-ink">频道列表</h2>
              <Button size="small" color="primary" fill="none" loading={busy} onClick={syncChannels}>刷新频道</Button>
            </div>
            {channels.length === 0 ? (
              <EmptyPanel title="暂无频道" hint="请刷新频道或检查 Token 状态" action={<Button color="primary" onClick={syncChannels}>刷新频道</Button>} />
            ) : (
              <ul className="space-y-3">
                {channels.map((channel) => <li key={channel.id}><ChannelCard channel={channel} /></li>)}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
