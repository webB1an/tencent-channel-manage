"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-line bg-paper px-3.5 h-10 text-body text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    />
  );
});
