import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

export function SectionHeader({ title, icon, count, action, className }: { title: string; icon?: IconName; count?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between py-3", className)}>
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={16} className="text-primary" />}
        <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        {count != null && <span className="text-xs text-ink-muted">{count}</span>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
