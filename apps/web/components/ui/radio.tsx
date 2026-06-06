"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Radio({ checked, onChange, disabled, children, name, value }: { checked: boolean; onChange: () => void; disabled?: boolean; children?: ReactNode; name?: string; value?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-2 select-none", disabled && "opacity-50 pointer-events-none")}>
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className={cn("h-4 w-4 rounded-full border bg-bg-card transition-colors", checked ? "border-primary" : "border-border")}>
          {checked && <span className="block h-2 w-2 rounded-full bg-primary" />}
        </span>
      </span>
      {children && <span className="text-md text-text">{children}</span>}
    </label>
  );
}

export function RadioGroup<T extends string>({ value, onChange, name, children }: { value: T; onChange: (v: T) => void; name?: string; children: ReactNode }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as Array<{ props: { value: T; disabled?: boolean; children?: ReactNode } }>;
  return (
    <div className="space-y-2">
      {items.map((child, i) => (
        <Radio
          key={String(child.props.value) + i}
          name={name}
          value={String(child.props.value)}
          checked={value === child.props.value}
          onChange={() => onChange(child.props.value)}
          disabled={child.props.disabled}
        >
          {child.props.children}
        </Radio>
      ))}
    </div>
  );
}
