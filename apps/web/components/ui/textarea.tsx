"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "block w-full rounded-md border bg-bg-card p-3 text-md text-text placeholder:text-text-3 transition-colors focus:outline-none focus:border-primary",
        "border-border",
        error && "border-danger",
        className
      )}
      {...rest}
    />
  );
});
