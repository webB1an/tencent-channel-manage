"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { PageHeader, StatCard, AccountCard, EmptyState } from "@/components/patterns";
import { accountService, type Account } from "@/lib/domain";

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountService.getAccountList()
      .then(setAccounts)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = accounts.filter((a) => a.status === "normal").length;
  const channelCount = accounts.reduce((sum, a) => sum + (a.channelCount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="运营工作台"
        subtitle="AI 辅助的频道运营"
        action={<Link href="/accounts/new"><Button size="sm" variant="ghost">＋ 账号</Button></Link>}
      />

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="活跃账号" value={activeCount} status="success" />
        <StatCard label="频道" value={channelCount} status="primary" />
        <StatCard label="任务" value={accounts.reduce((s, a) => s + (a.pendingTaskCount ?? 0), 0)} status="warning" />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg text-text">最近账号</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton height={120} className="block" />
            <Skeleton height={120} className="block" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="暂无账号"
            hint="绑定 Token 后开始管理频道"
            action={<Link href="/accounts/new"><Button>＋ 新增账号</Button></Link>}
          />
        ) : (
          <ul className="space-y-3">
            {accounts.map((a) => <li key={a.id}><AccountCard account={a} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
