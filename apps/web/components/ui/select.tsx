"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { Sheet } from "./sheet";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "请选择",
  title,
  className,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 text-left text-md text-text u-press",
          !current && "text-text-3",
          className
        )}
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <Icon name="chevron-right" size={14} className="text-text-3" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title={title ?? "请选择"}>
        <ul className="divide-y divide-border">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                disabled={o.disabled}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-md u-press",
                  o.value === value && "text-primary",
                  o.disabled && "opacity-40 pointer-events-none"
                )}
              >
                <span>{o.label}</span>
                {o.value === value && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
