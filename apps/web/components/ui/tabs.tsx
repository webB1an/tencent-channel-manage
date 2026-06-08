"use client";

import { cn } from "@/lib/cn";

export interface TabItem { key: string; label: string }

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: TabItem[]; className?: string }) {
  return (
    <div role="tablist" className={cn("flex bg-transparent", className)}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key as T)}
            className={cn(
              "relative flex-1 py-3 text-center text-[14px] transition-colors u-press",
              active ? "font-semibold text-primary" : "font-medium text-ink-variant"
            )}
          >
            {it.label}
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
