"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

interface ChannelRowProps {
  name: string;
  channelId: string;
  accountId: string;
  sectionCount?: number;
  taskCount?: number;
  status?: "active" | "idle" | "stopped" | "normal" | "error";
  channelType?: IconName;
  href?: string;
}

const statusColor: Record<NonNullable<ChannelRowProps["status"]>, string> = {
  active: "text-success",
  idle: "text-warning",
  stopped: "text-ink-faint",
  normal: "text-success",
  error: "text-danger",
};

const statusLabel: Record<NonNullable<ChannelRowProps["status"]>, string> = {
  active: "Active",
  idle: "Idle",
  stopped: "Stopped",
  normal: "Normal",
  error: "Error",
};

export function ChannelRow({ name, channelId, accountId, sectionCount, taskCount, status = "active", channelType = "megaphone", href }: ChannelRowProps) {
  const target = href ?? `/accounts/${accountId}/channels/${encodeURIComponent(channelId)}`;
  return (
    <Link
      href={target}
      className="flex items-center gap-3 rounded-lg border border-border bg-bg-card p-3 transition-colors hover:border-primary u-press"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
        <Icon name={channelType} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-display text-[14px] font-semibold text-ink">{name}</h3>
          <span className={`rounded-sm border border-current/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${statusColor[status]}`}>
            {statusLabel[status]}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-muted tabular">
          <span>ID: {channelId}</span>
          {typeof sectionCount === "number" && <span>· {sectionCount} 分区</span>}
          {typeof taskCount === "number" && <span>· {taskCount} 任务</span>}
        </p>
      </div>
      <Icon name="chevron-right" size={16} className="flex-shrink-0 text-ink-faint" />
    </Link>
  );
}
