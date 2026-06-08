"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outlined";
type Size = "sm" | "md" | "lg" | "xl";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-elev-1",
  secondary: "bg-bg-card text-ink border border-border hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-ink-2 hover:bg-surface-container",
  danger: "bg-danger text-white hover:brightness-110",
  outlined: "bg-bg-card text-danger border border-danger/40 hover:bg-danger-soft",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-11 px-5 text-[15px]",
  xl: "h-12 px-6 text-[15px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", block, loading, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "u-press inline-flex items-center justify-center gap-1.5 rounded font-medium select-none disabled:opacity-50 disabled:pointer-events-none",
        "transition-colors duration-150",
        variantClass[variant],
        sizeClass[size],
        block && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
});
