"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-line bg-paper px-3.5 py-3 text-body text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50 resize-y";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    />
  );
});
