"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusTag } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatShortDate } from "@/lib/utils";
import type { ExecutionRecord } from "@/lib/domain";

const typeToIcon: Record<string, IconName> = {
  INSPECTION: "shield",
  HOT_SUMMARY: "trending-up",
};

export function ExecutionRecordCard({ record }: { record: ExecutionRecord }) {
  const iconName = typeToIcon[record.taskType] ?? "zap";
  const failed = record.status === "failed";
  const success = record.status === "success";
  const tone = failed ? "danger" : success ? "success" : record.status === "running" ? "info" : "warning";
  const label = failed ? "失败" : success ? "成功" : record.status === "running" ? "执行中" : "等待中";

  return (
    <Link href={`/tasks/records/${record.id}`} className="block">
      <Card padding="md" className={cn(
        "space-y-3 transition-colors hover:border-primary",
        failed && "border-l-4 border-l-danger",
        success && "border-l-4 border-l-success"
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg",
              failed ? "bg-danger-soft text-danger" : "bg-info-soft text-info"
            )}>
              <Icon name={iconName} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-[15px] font-semibold text-ink">{record.taskName || record.taskType}</h3>
                <StatusTag status={tone} label={label} dot className="h-[20px]" />
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-ink-muted">ID: {record.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">账号</dt>
            <dd className="mt-0.5 truncate text-ink">{record.accountSnapshot.nickname || record.accountSnapshot.qq}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">渠道</dt>
            <dd className="mt-0.5 truncate text-ink">{record.channelSnapshot?.name ?? "全账号"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">模式</dt>
            <dd className="mt-0.5 truncate text-ink">{record.executionMode === "immediate" ? "Immediate" : "Schedule"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">时间</dt>
            <dd className="mt-0.5 truncate text-ink tabular">{formatShortDate(record.startedAt) || "—"}</dd>
          </div>
        </dl>

        {failed && record.errorMessage && (
          <div className="rounded border border-danger/30 bg-danger-soft p-2.5 text-[12px] text-danger">
            <div className="flex items-center gap-1.5 font-semibold">
              <Icon name="alert-circle" size={12} />
              执行异常
            </div>
            <p className="mt-1 line-clamp-2 text-[11px]">{record.errorMessage}</p>
          </div>
        )}
      </Card>
    </Link>
  );
}

function cn(...args: Array<string | false | null | undefined>): string {
  return args.filter(Boolean).join(" ");
}
