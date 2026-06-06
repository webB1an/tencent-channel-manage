"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Dialog, Skeleton, Toast } from "antd-mobile";
import { accountService, type Account } from "@/lib/domain";
import { AccountCard, EmptyPanel, PageHeader } from "@/components/business/Mobile";

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setAccounts(await accountService.getAccountList());
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function deleteAccount(account: Account) {
    const risk = await accountService.checkAccountDeleteRisk(account.id);
    if (risk.runningCount > 0) {
      Dialog.alert({ content: "当前账号存在执行中的任务，请等待任务结束后再删除。" });
      return;
    }
    const content = risk.enabledScheduleCount > 0
      ? `该账号存在 ${risk.enabledScheduleCount} 个启用中的定时任务。删除账号前需要处理这些任务。`
      : "确认删除账号？删除后 Token 将被移除，历史执行记录仍会保留。";
    const ok = await Dialog.confirm({ title: "删除账号", content, confirmText: risk.enabledScheduleCount > 0 ? "停用关联定时任务后删除" : "确认删除" });
    if (!ok) return;
    await accountService.deleteAccount(account.id);
    Toast.show({ content: "账号已删除" });
    await refresh();
  }

  return (
    <main className="page-pad">
      <PageHeader title="首页" action={<Button size="small" color="primary" fill="none" onClick={refresh}>刷新</Button>} />

      <Link href="/accounts/new" className="block">
        <Button block color="primary" size="large">＋ 新增账号</Button>
      </Link>

      <section className="mt-4">
        {loading ? (
          <div className="surface rounded-lg p-4">
            <Skeleton.Title animated />
            <Skeleton.Paragraph lineCount={4} animated />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyPanel
            title="暂无绑定账号"
            hint="绑定 Token 后开始管理频道"
            action={<Link href="/accounts/new"><Button color="primary">＋ 新增账号</Button></Link>}
          />
        ) : (
          <ul className="space-y-3">
            {accounts.map((account) => (
              <li key={account.id}>
                <AccountCard account={account} onDelete={() => deleteAccount(account)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

