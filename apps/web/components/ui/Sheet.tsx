"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; loading?: boolean; danger?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  className,
}: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = React.useId();

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40"
      style={{ animation: "fadeIn 200ms var(--ease-out-quint, cubic-bezier(0.22,1,0.36,1)) both" }}
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-t-xl bg-paper p-5 shadow-sheet",
          className,
        )}
        style={{
          paddingBottom: "calc(20px + var(--safe-bottom))",
          animation: "sheetUp 320ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line-strong" />
        {title && <h2 id={titleId} className="text-h1 text-ink">{title}</h2>}
        {description && <p className="mt-2 text-body text-ink-2">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        {(primaryAction || secondaryAction) && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="tap h-12 rounded-md bg-paper-2 text-ink text-body font-medium"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className={cn(
                  "tap h-12 rounded-md text-body font-medium disabled:opacity-60",
                  !secondaryAction && "col-span-2",
                  primaryAction.danger
                    ? "bg-risk-high text-white"
                    : "bg-ink text-ink-inverse",
                )}
              >
                {primaryAction.loading ? <span className="font-mono">···</span> : primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
