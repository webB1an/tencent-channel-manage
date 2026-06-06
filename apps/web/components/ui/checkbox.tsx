"use client";

import { Children, useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Checkbox({ checked, onChange, disabled, children }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; children?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-2 select-none", disabled && "opacity-50 pointer-events-none")}>
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className={cn("h-4 w-4 rounded border bg-bg-card transition-colors", checked ? "border-primary bg-primary" : "border-border")}>
          {checked && <Icon name="check" size={12} className="text-white" />}
        </span>
      </span>
      {children && <span className="text-md text-text">{children}</span>}
    </label>
  );
}

export function CheckboxGroup<T extends string>({ value, onChange, children }: { value: T[]; onChange: (v: T[]) => void; children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean) as Array<{ props: { value: T; children?: ReactNode } }>;
  return (
    <div className="space-y-2">
      {items.map((child, i) => {
        const childValue = child.props.value;
        return (
          <Checkbox
            key={String(childValue) + i}
            checked={value.includes(childValue)}
            onChange={(c) => onChange(c ? [...value, childValue] : value.filter((x) => x !== childValue))}
          >
            {child.props.children}
          </Checkbox>
        );
      })}
    </div>
  );
}
