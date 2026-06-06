"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function ListRow({ title, description, prefix, suffix, onClick, className }: { title: ReactNode; description?: ReactNode; prefix?: ReactNode; suffix?: ReactNode; onClick?: () => void; className?: string }) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex min-h-[56px] items-center gap-3 border-b border-border bg-bg-card px-4 py-3",
        interactive && "u-row-press cursor-pointer",
        className
      )}
    >
      {prefix && <span className="flex h-6 w-6 items-center justify-center text-text-3">{prefix}</span>}
      <div className="min-w-0 flex-1">
        <div className="text-md text-text">{title}</div>
        {description && <div className="mt-0.5 text-sm text-text-3">{description}</div>}
      </div>
      {suffix !== undefined && <span className="text-sm text-text-3">{suffix ?? <Icon name="chevron-right" size={14} className="text-text-3" />}</span>}
    </div>
  );
}
