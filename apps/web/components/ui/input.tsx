"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  error?: boolean;
  prefix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, prefix, ...rest },
  ref
) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-md border bg-bg-card px-3 transition-colors",
        "border-border focus-within:border-primary",
        error && "border-danger focus-within:border-danger"
      )}
    >
      {prefix && <span className="text-text-3">{prefix}</span>}
      <input
        ref={ref}
        className={cn("h-full w-full bg-transparent text-md text-text placeholder:text-text-3 focus:outline-none", className)}
        {...rest}
      />
    </div>
  );
});
