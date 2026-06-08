"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Sheet } from "@/components/ui/sheet";
import { AccountCard, EmptyState, SectionHeader, StatTile } from "@/components/patterns";
import { accountService, type Account } from "@/lib/domain";

export default function HomePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    setLoading(true);
    return accountService
      .getAccountList()
      .then(setAccounts)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const totalCount = accounts.length;
  const normalCount = accounts.filter((a) => a.status === "normal").length;
  const errorCount = accounts.filter((a) => a.status === "error" || a.status === "expired").length;

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all(accounts.map((a) => accountService.refreshAccountStatus(a.id).catch(() => null)));
      await load();
      Toast.show({ content: "已刷新", type: "success" });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="page-shell space-y-5">
      {/* App bar */}
      <header className="flex h-14 items-center justify-between bg-bg-page px-1">
        <h1 className="font-display text-[20px] font-semibold text-ink">首页</h1>
        <div className="flex items-center">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="刷新"
            className="flex h-10 w-10 items-center justify-center text-ink-2 u-press hover:bg-surface-container rounded"
          >
            <Icon name="refresh" size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="更多"
            className="flex h-10 w-10 items-center justify-center text-ink-2 u-press hover:bg-surface-container rounded"
          >
            <Icon name="more-vertical" size={20} />
          </button>
        </div>
      </header>

      {/* Primary CTA */}
      <Link href="/accounts/new" className="block">
        <Button block size="lg" className="shadow-primary">
          <Icon name="plus-circle" size={18} />
          新增账号
        </Button>
      </Link>

      {/* Stat tiles — left big card + right two stacked cards */}
      <section className="grid grid-cols-2 gap-3">
        <StatTile
          label="总账号数"
          value={totalCount}
          icon="users"
          tone="primary"
          onClick={() => router.push("/?tab=accounts")}
        />
        <div className="grid gap-3">
          <StatTile label="正常运行" value={normalCount} icon="check-circle" tone="success" />
          <StatTile label="异常报警" value={errorCount} icon="alert-circle" tone="danger" />
        </div>
      </section>

      {/* Account list */}
      <section>
        <SectionHeader title="账号管理" count={loading ? undefined : `共 ${totalCount} 个`} />
        {loading ? (
          <div className="space-y-3">
            <Skeleton height={160} className="block rounded-lg" />
            <Skeleton height={160} className="block rounded-lg" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon="users"
            title="还没有账号"
            hint="新增账号后即可管理频道与定时任务"
            action={
              <Link href="/accounts/new">
                <Button>
                  <Icon name="plus" size={16} />
                  新增账号
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {accounts.map((a) => (
              <li key={a.id}>
                <AccountCard account={a} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="更多">
        <ul className="divide-y divide-border">
          {[
            { label: "刷新账号状态", icon: "refresh" as const, onClick: onRefresh },
            { label: "任务中心", icon: "tasks" as const, onClick: () => router.push("/tasks") },
            { label: "我的", icon: "profile" as const, onClick: () => router.push("/mine") },
          ].map((it) => (
            <li key={it.label}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  it.onClick();
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[14px] text-ink u-press hover:bg-surface-container"
              >
                <Icon name={it.icon} size={18} className="text-ink-variant" />
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </main>
  );
}
