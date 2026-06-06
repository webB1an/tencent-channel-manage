"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-lg border border-line bg-paper-2 px-3.5 h-11 text-body text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus:border-accent focus:bg-paper-2 focus:shadow-[0_0_0_3px_rgb(var(--accent)_/_0.12)] disabled:opacity-50";

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
