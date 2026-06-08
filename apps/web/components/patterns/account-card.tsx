"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "./status-badge";
import { TokenText } from "./token-text";
import { formatShortDate } from "@/lib/utils";
import type { Account } from "@/lib/domain";

export function AccountCard({ account, onDelete }: { account: Account; onDelete?: () => void }) {
  const pendingCount = account.pendingTaskCount ?? 0;
  const isProblem = account.status === "error" || account.status === "expired";

  return (
    <Card
      padding="none"
      className={cn(
        "overflow-hidden border-border-soft bg-bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elev-2",
        isProblem && "border-danger/30"
      )}
    >
      <div className={cn("h-1 w-full", isProblem ? "bg-danger" : "bg-primary")} />

      <div className="space-y-3 p-3.5">
        <Link href={`/accounts/${account.id}`} className="block space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg font-display text-[16px] font-semibold",
                  isProblem ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary"
                )}
              >
                {(account.nickname || account.qq).charAt(0).toUpperCase()}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-sm border-2 border-bg-card",
                    isProblem ? "bg-danger" : "bg-success"
                  )}
                />
              </span>

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate font-display text-[16px] font-semibold leading-5 text-ink">
                    {account.nickname || "未命名账号"}
                  </h2>
                  <StatusBadge status={account.status} className="flex-shrink-0" />
                </div>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-ink-muted">
                  <span className="truncate">QQ: {account.qq}</span>
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-border-strong" />
                  <TokenText tail={account.tokenTail} />
                </p>
              </div>
            </div>
            <Icon name="chevron-right" size={18} className="mt-2 flex-shrink-0 text-ink-faint" />
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-md bg-surface-container-low ring-1 ring-border-soft">
            <Metric label="频道数" value={account.channelCount ?? 0} />
            <Metric label="待处理" value={pendingCount} tone={pendingCount > 0 ? "warning" : "default"} />
            <Metric label="最后运行" value={account.lastRunAt ? formatShortDate(account.lastRunAt) : "暂无"} compact />
          </div>
        </Link>

        <div className={cn("flex items-center gap-2 pt-0.5", onDelete ? "justify-between" : "justify-end")}>
          <div className="flex items-center gap-2">
            <Link href={`/accounts/${account.id}`}>
              <Button size="sm" variant="ghost" className="!h-8 !px-2.5 text-[12px] text-ink-variant hover:text-primary">
                <Icon name="eye" size={14} />
                详情
              </Button>
            </Link>
            <Link href={`/accounts/${account.id}/edit`}>
              <Button size="sm" variant="secondary" className="!h-8 !px-3 text-[12px]">
                <Icon name="edit-2" size={14} />
                编辑
              </Button>
            </Link>
          </div>
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="!h-8 text-[12px] text-danger hover:bg-danger-soft">
              <Icon name="trash" size={14} />
              删除
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone = "default",
  compact,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning";
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 border-r border-border-soft px-2.5 py-2.5 text-center last:border-r-0">
      <p
        className={cn(
          "truncate font-display font-semibold tabular",
          compact ? "text-[13px] leading-5" : "text-[19px] leading-5",
          tone === "warning" ? "text-warning" : "text-ink"
        )}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}

function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
