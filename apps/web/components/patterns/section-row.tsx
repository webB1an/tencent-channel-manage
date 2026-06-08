"use client";

import { Icon, type IconName } from "@/components/ui/icon";

interface SectionRowProps {
  name: string;
  icon?: IconName;
  badge?: { text: string; tone: "primary" | "success" | "warning" | "danger" | "info" | "neutral" };
  onClick?: () => void;
  rightText?: string;
}

const toneClass = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-container text-ink-variant",
} as const;

export function SectionRow({ name, icon = "megaphone", badge, onClick, rightText }: SectionRowProps) {
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-bg-card p-3 text-left transition-colors hover:border-primary u-press"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
        <Icon name={icon} size={18} />
      </span>
      <span className="flex-1 truncate font-display text-[14px] font-medium text-ink">{name}</span>
      {badge && (
        <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${toneClass[badge.tone]}`}>
          {badge.text}
        </span>
      )}
      {rightText && <span className="text-[12px] text-ink-muted">{rightText}</span>}
      {onClick && <Icon name="chevron-right" size={16} className="flex-shrink-0 text-ink-faint" />}
    </Wrapper>
  );
}
