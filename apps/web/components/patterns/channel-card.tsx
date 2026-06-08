"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "./status-badge";
import type { Channel } from "@/lib/domain";

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link href={`/accounts/${channel.accountId}/channels/${channel.id}`} className="block">
      <Card padding="md" className="space-y-3 transition-colors hover:border-primary">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
              <Icon name="hash" size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-display text-[15px] font-semibold text-ink">{channel.name}</h3>
              <p className="text-[11px] text-ink-muted">ID: {channel.channelId}</p>
            </div>
          </div>
          <StatusBadge status={channel.status ?? "normal"} />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-[12px] text-ink-variant">
          <span>定时任务 {channel.scheduledTaskCount ?? 0} · 板块 {channel.sectionCount ?? 0}</span>
          <span className="flex items-center gap-1 text-primary">
            进入 <Icon name="arrow-right" size={12} />
          </span>
        </div>
      </Card>
    </Link>
  );
}
