"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useEscape, useBodyScrollLock } from "@/lib/a11y";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Sheet({ open, onOpenChange, title, children, actions }: { open: boolean; onOpenChange: (v: boolean) => void; title?: string; children: ReactNode; actions?: ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscape(() => onOpenChange(false), open);
  useBodyScrollLock(open);

  if (typeof document === "undefined" || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 anim-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-lg bg-bg-card anim-sheet-up",
          "shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-lg text-text">{title}</h3>
          <button onClick={() => onOpenChange(false)} className="text-text-3 u-press" aria-label="关闭">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="max-h-[calc(80vh-56px-env(safe-area-inset-bottom))] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
        {actions && <div className="border-t border-border p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}
