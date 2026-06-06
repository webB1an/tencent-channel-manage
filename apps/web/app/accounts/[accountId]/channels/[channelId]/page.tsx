"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { TokenRow, StatusBadge, EmptyState } from "@/components/patterns";
import { accountService, channelService, type Account, type Channel, type Section } from "@/lib/domain";

export default function ChannelDetailPage({ params }: { params: { accountId: string; channelId: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountService.getAccountDetail(params.accountId),
      channelService.getChannelDetail(params.accountId, params.channelId),
      channelService.getSectionsByChannel(params.accountId, params.channelId),
    ])
      .then(([a, c, s]) => { setAccount(a); setChannel(c); setSections(s); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.accountId, params.channelId]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!channel) return <TopBar title="频道详情" />;

  const tokenTail = channel.id.slice(-4) || "----";

  return (
    <>
      <TopBar title={channel.name} />
      <main className="page-shell space-y-4">
        <section className="rounded-lg border border-border bg-bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{channel.name}</h2>
              <p className="mt-1 text-xs text-text-3">ID：{channel.channelId}</p>
              {account && <p className="mt-1 text-sm text-text-2">账号：{account.nickname || account.qq}</p>}
            </div>
            <StatusBadge status="normal" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg text-text">板块</h3>
          {sections.length === 0 ? <EmptyState title="暂无板块" /> : (
            <ul className="overflow-hidden rounded-lg border border-border bg-bg-card">
              {sections.map((s) => (
                <li key={s.id} className="border-b border-border px-4 py-3 last:border-0">
                  <p className="text-md text-text">{s.name}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <TokenRow
          name="频道 Token"
          token={`tk_****${tokenTail}`}
          status={{ variant: "success", text: "有效" }}
        />
      </main>
    </>
  );
}
