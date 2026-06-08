"use client";

import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix"> {
  error?: boolean;
  label?: string;
  hint?: string;
  prefix?: ReactNode;
  optional?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, label, hint, optional, prefix, rows = 4, id, ...rest },
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
          "flex w-full items-start gap-2 rounded border bg-bg-card px-3 py-2.5 transition-colors",
          error ? "border-danger focus-within:border-danger" : "border-border focus-within:border-primary",
          className
        )}
      >
        {prefix && <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center pt-0.5 text-ink-muted">{prefix}</span>}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className="block w-full resize-none bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
          {...rest}
        />
      </div>
      {hint && <p className={cn("mt-1 text-xs", error ? "text-danger" : "text-ink-muted")}>{hint}</p>}
    </div>
  );
});
