"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type ToastType = "info" | "success" | "error";

interface ToastState { id: number; content: ReactNode; type: ToastType }

let counter = 0;
const listeners = new Set<(t: ToastState) => void>();

export const Toast = {
  show(opts: { content: ReactNode; duration?: number; type?: ToastType }) {
    const item: ToastState = { id: ++counter, content: opts.content, type: opts.type ?? "info" };
    listeners.forEach((l) => l(item));
  },
};

export function ToastHost() {
  const [items, setItems] = useState<ToastState[]>([]);

  useEffect(() => {
    const onItem = (t: ToastState) => {
      setItems((arr) => [...arr, t]);
      window.setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== t.id)), 2500);
    };
    listeners.add(onItem);
    return () => { listeners.delete(onItem); };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(16px+env(safe-area-inset-top))]">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto rounded-md px-4 py-2 text-sm text-white shadow-md anim-slide-down",
            t.type === "success" && "bg-success",
            t.type === "error" && "bg-danger",
            t.type === "info" && "bg-text"
          )}
        >
          {t.content}
        </div>
      ))}
    </div>,
    document.body
  );
}
