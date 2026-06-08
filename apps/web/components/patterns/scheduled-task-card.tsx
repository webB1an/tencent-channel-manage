"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/badge";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatShortDate } from "@/lib/utils";
import type { ScheduledTask } from "@/lib/domain";

const typeToIcon: Record<string, IconName> = {
  INSPECTION: "shield",
  HOT_SUMMARY: "trending-up",
  SYNC_CHANNELS: "refresh-cw",
};

export function ScheduledTaskCard({ task, onToggle }: { task: ScheduledTask; onToggle?: () => void }) {
  const iconName = typeToIcon[task.taskType] ?? "clock";
  const status = task.status === "enabled" ? "success" : task.status === "disabled" ? "neutral" : "warning";
  const statusText = task.status === "enabled" ? "已启用" : task.status === "disabled" ? "已停用" : "异常";

  return (
    <Card padding="md" className="space-y-3">
      <Link href={`/tasks/schedules/${task.id}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
              <Icon name={iconName} size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-semibold text-ink">{task.name || task.taskType}</h3>
              <p className="text-[11px] text-ink-muted font-mono">ID: TK-{task.id.slice(0, 6).toUpperCase()}</p>
            </div>
          </div>
          <StatusTag status={status} label={statusText} dot />
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border pt-3 text-[12px]">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">执行账号</dt>
            <dd className="mt-0.5 truncate text-ink">{task.accountId.slice(0, 10)}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">渠道类型</dt>
            <dd className="mt-0.5 truncate text-ink">{task.targetLevel === "account" ? "全账号" : "频道级"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">执行范围</dt>
            <dd className="mt-0.5 truncate text-ink">{task.rangeType === "all" ? "全频道" : `${task.sectionIds.length} 分区`}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-ink-faint">调度规则</dt>
            <dd className="mt-0.5 truncate text-ink">{task.nextRunAt || "立即"}</dd>
          </div>
        </dl>

        {task.nextRunAt && (
          <p className="flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-ink-muted">
            <Icon name="clock" size={12} />
            <span>下次运行：<span className="text-ink">{task.nextRunAt}</span></span>
          </p>
        )}
      </Link>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Link href={`/tasks/schedules/${task.id}`} className="flex-1">
          <Button block size="sm" variant="primary" className="!h-9">
            详情
          </Button>
        </Link>
        {onToggle && (
          <Button size="sm" variant={task.status === "enabled" ? "secondary" : "primary"} className="!h-9" onClick={onToggle}>
            {task.status === "enabled" ? "停用" : "启用"}
          </Button>
        )}
      </div>
    </Card>
  );
}
