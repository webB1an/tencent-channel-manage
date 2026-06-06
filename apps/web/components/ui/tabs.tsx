"use client";

import { cn } from "@/lib/cn";

export interface TabItem { key: string; label: string }

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: TabItem[]; className?: string }) {
  return (
    <div role="tablist" className={cn("flex border-b border-border bg-bg-card", className)}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key as T)}
            className={cn(
              "relative flex-1 py-3 text-center text-md transition-colors u-press",
              active ? "text-primary" : "text-text-2"
            )}
          >
            {it.label}
            {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
