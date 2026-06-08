"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  label?: string;
  hint?: string;
  optional?: boolean;
  required?: boolean;
  size?: "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, prefix, suffix, label, hint, optional, id, size = "md", ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 flex items-baseline gap-1 text-[13px] font-medium text-ink">
          <span>{label}</span>
          {optional && <span className="text-ink-faint">（选填）</span>}
        </label>
      )}
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded border bg-bg-card px-3 transition-colors",
          size === "md" && "h-10",
          size === "lg" && "h-12",
          error ? "border-danger focus-within:border-danger" : "border-border focus-within:border-primary",
          className
        )}
      >
        {prefix && <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-ink-muted">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          className="h-full w-full min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          {...rest}
        />
        {suffix && <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-ink-muted">{suffix}</span>}
      </div>
      {hint && <p className={cn("mt-1 text-xs", error ? "text-danger" : "text-ink-muted")}>{hint}</p>}
    </div>
  );
});
