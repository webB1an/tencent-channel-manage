"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface TabBarItem { key: string; label: string; icon: ReactNode; href?: string }

export function TabBar({ activeKey, items, onChange }: { activeKey: string; items: TabBarItem[]; onChange?: (k: string) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-phone items-stretch border-t border-border bg-bg-card shadow-tabbar"
      style={{ height: 64, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="主导航"
    >
      {items.map((it) => {
        const active = it.key === activeKey;
        const handleClick = () => {
          if (onChange) onChange(it.key);
          else if (it.href) window.location.href = it.href;
        };
        return (
          <button
            key={it.key}
            type="button"
            onClick={handleClick}
            className={cn(
              "flex h-full flex-1 flex-col items-center justify-center gap-0.5 u-press transition-colors",
              active ? "text-primary" : "text-ink-muted"
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className="flex h-6 w-6 items-center justify-center">{it.icon}</span>
            <span className="text-[11px] font-medium">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
