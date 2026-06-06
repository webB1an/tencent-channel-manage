"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full appearance-none rounded-md border border-line bg-paper pl-3.5 pr-9 h-10 text-body text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50 bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%208%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%221.6%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22M1%201.5l5%205%205-5%22/></svg>')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    >
      {children}
    </select>
  );
});
