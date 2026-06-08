import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon: IconName;
  tone?: "primary" | "success" | "danger" | "warning";
  onClick?: () => void;
  className?: string;
}

const toneClass = {
  primary: { bg: "bg-info-soft", text: "text-info" },
  success: { bg: "bg-success-soft", text: "text-success" },
  danger: { bg: "bg-danger-soft", text: "text-danger" },
  warning: { bg: "bg-warning-soft", text: "text-warning" },
} as const;

export function StatTile({ label, value, icon, tone = "primary", onClick, className }: StatTileProps) {
  const toneCfg = toneClass[tone];
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-3 text-left transition-colors",
        onClick && "u-press hover:border-primary",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium text-ink-variant">{label}</span>
        <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full", toneCfg.bg, toneCfg.text)}>
          <Icon name={icon} size={14} />
        </span>
      </div>
      <div className="font-display text-[24px] font-semibold leading-none text-ink tabular">{value}</div>
    </Wrapper>
  );
}
