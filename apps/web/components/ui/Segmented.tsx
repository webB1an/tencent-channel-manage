"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "grid gap-1 rounded-xl bg-paper-sunken p-1",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "tap h-11 rounded-lg text-small font-semibold transition-colors duration-[180ms] ease-out-quint",
              active ? "bg-paper-2 text-ink shadow-[0_4px_14px_-12px_rgb(15_23_42/0.8)]" : "text-ink-3 hover:text-ink",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span className={cn("ml-1.5 text-micro", active ? "text-ink-inverse/70" : "text-ink-3")}>
                · {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
