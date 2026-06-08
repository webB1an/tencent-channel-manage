"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function ListRow({ title, description, prefix, suffix, onClick, className }: { title: ReactNode; description?: ReactNode; prefix?: ReactNode; suffix?: ReactNode; onClick?: () => void; className?: string }) {
  const interactive = !!onClick;
  const inner = (
    <>
      {prefix && <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-container text-ink-variant">{prefix}</span>}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink">{title}</div>
        {description && <div className="mt-0.5 text-[12px] text-ink-muted">{description}</div>}
      </div>
      {suffix !== undefined ? <span className="text-[13px] text-ink-variant">{suffix}</span> : onClick && <Icon name="chevron-right" size={16} className="text-ink-faint" />}
    </>
  );
  const baseClass = cn(
    "flex min-h-[56px] items-center gap-3 border-b border-border bg-bg-card px-4 py-3 text-left w-full last:border-b-0",
    interactive && "u-row-press cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    className
  );
  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClass}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}
