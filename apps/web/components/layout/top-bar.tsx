"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

interface ActionButton { icon: ReactNode; onClick: () => void; label: string }

export interface TopBarProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  actions?: ActionButton[];
  centerAction?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function TopBar({ title, onBack, showBack = true, right, actions, centerAction, subtitle, className }: TopBarProps) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center border-b border-border bg-bg-card/95 px-2 backdrop-blur",
        className
      )}
    >
      {showBack ? (
        <button
          onClick={back}
          aria-label="返回"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded text-ink-2 u-press hover:bg-surface-container"
        >
          <Icon name="arrow-left" size={20} />
        </button>
      ) : (
        <span className="w-2" />
      )}

      <h1 className="flex-1 truncate text-center text-[17px] font-semibold text-ink font-display">{title}</h1>

      {centerAction && <div className="absolute left-1/2 -translate-x-1/2">{centerAction}</div>}

      {actions && actions.length > 0 ? (
        <div className="flex items-center">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              aria-label={a.label}
              className="flex h-10 w-10 items-center justify-center rounded text-ink-2 u-press hover:bg-surface-container"
            >
              {a.icon}
            </button>
          ))}
        </div>
      ) : right ? (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">{right}</div>
      ) : (
        <span className="w-2" />
      )}

      {subtitle && <span className="sr-only">{subtitle}</span>}
    </header>
  );
}
