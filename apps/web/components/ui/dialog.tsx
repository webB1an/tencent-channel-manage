"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useEscape } from "@/lib/a11y";
import { cn } from "@/lib/cn";

export function Dialog({ open, onOpenChange, title, content, actions }: { open: boolean; onOpenChange: (v: boolean) => void; title?: string; content: ReactNode; actions?: ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscape(() => onOpenChange(false), open);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof document === "undefined" || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40 anim-fade-in" onClick={() => onOpenChange(false)} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full max-w-[320px] rounded-lg bg-bg-card p-5 anim-pop-in")}
      >
        {title && <h3 className="text-xl text-text">{title}</h3>}
        <div className="mt-2 text-md text-text-2">{content}</div>
        {actions && <div className="mt-5 flex gap-2">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}
