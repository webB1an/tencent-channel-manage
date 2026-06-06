"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface TabBarItem { key: string; label: string; icon: ReactNode; href?: string }

export function TabBar({ activeKey, items, onChange }: { activeKey: string; items: TabBarItem[]; onChange: (key: string) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ height: 78, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="主导航"
    >
      <div className="flex h-full">
        {items.map((it) => {
          const active = it.key === activeKey;
          const node = (
            <button
              type="button"
              onClick={() => onChange(it.key)}
              className={cn("flex h-full flex-1 flex-col items-center justify-center gap-0.5 u-press", active ? "text-primary" : "text-text-3")}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex h-6 w-6 items-center justify-center">{it.icon}</span>
              <span className="text-[10px]">{it.label}</span>
            </button>
          );
          return it.href ? <Link key={it.key} href={it.href} className="flex-1">{node}</Link> : <div key={it.key} className="flex-1">{node}</div>;
        })}
      </div>
    </nav>
  );
}
