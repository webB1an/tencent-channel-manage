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
  return (
    <Card padding="md" className="space-y-3">
      <Link href={`/accounts/${account.id}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary font-semibold">
              {(account.nickname || account.qq).charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-[15px] font-semibold text-ink">{account.nickname || "未命名账号"}</h2>
              <p className="text-xs text-ink-muted">QQ: {account.qq}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={account.status} />
            <span className="font-mono text-[11px] text-ink-faint">
              <TokenText tail={account.tokenTail} />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
          <div>
            <p className="font-display text-[18px] font-semibold tabular text-ink">{account.channelCount ?? 0}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">频道数</p>
          </div>
          <div>
            <p className={cn(
              "font-display text-[18px] font-semibold tabular",
              (account.pendingTaskCount ?? 0) > 0 ? "text-warning" : "text-ink"
            )}>
              {account.pendingTaskCount ?? 0}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">待处理任务</p>
          </div>
          <div>
            <p className="font-display text-[12px] font-medium tabular text-ink-variant">
              {account.lastRunAt ? formatShortDate(account.lastRunAt) : "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">最后运行</p>
          </div>
        </div>
      </Link>

      <div className={cn("flex items-center gap-2 border-t border-border pt-3", onDelete ? "justify-between" : "gap-2")}>
        <div className="flex items-center gap-2">
          <Link href={`/accounts/${account.id}`}>
            <Button size="sm" variant="secondary" className="!h-8 !px-2.5 text-[12px]">
              <Icon name="eye" size={14} />
              详情
            </Button>
          </Link>
          <Link href={`/accounts/${account.id}/edit`}>
            <Button size="sm" variant="secondary" className="!h-8 !px-2.5 text-[12px]">
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
    </Card>
  );
}

function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
