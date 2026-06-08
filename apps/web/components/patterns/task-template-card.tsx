"use client";

import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { TaskTemplate } from "@/lib/domain";

const levelToTone: Record<string, string> = {
  channel: "bg-info-soft text-info border-info/30",
  account: "bg-warning-soft text-warning border-warning/30",
};

const typeToIcon: Record<string, IconName> = {
  INSPECTION: "shield",
  HOT_SUMMARY: "trending-up",
};

export function TaskTemplateCard({ template, selected, onClick }: { template: TaskTemplate; selected?: boolean; onClick?: () => void }) {
  const iconName = typeToIcon[template.type] ?? "zap";
  return (
    <button onClick={onClick} className="w-full text-left u-press">
      <Card padding="md" className={cn("space-y-3 transition-all", selected && "border-primary bg-primary-soft/40 ring-2 ring-primary")}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
            <Icon name={iconName} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[15px] font-semibold text-ink">{template.name}</h3>
              <span className={cn("rounded-sm border px-1.5 py-0.5 text-[10px] font-bold tracking-wider", levelToTone[template.targetLevel])}>
                {template.targetLevel === "channel" ? "Channel-level" : "Account-level"}
              </span>
            </div>
            {template.description && <p className="mt-1.5 line-clamp-2 text-[12px] text-ink-variant">{template.description}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-ink-muted">
          <span className="font-mono">Token ID: {template.type.slice(0, 4)}-****</span>
          <span className="font-medium text-primary">{selected ? "已选择" : "去创建 →"}</span>
        </div>
      </Card>
    </button>
  );
}
