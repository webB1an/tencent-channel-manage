"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary text-white hover:brightness-105 active:brightness-95",
  secondary: "bg-bg-card text-text border border-border hover:bg-primary-soft",
  ghost: "bg-transparent text-text hover:bg-primary-soft",
  danger: "bg-danger text-white hover:brightness-105",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-md",
  lg: "h-12 px-5 text-lg",
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
        "u-press inline-flex items-center justify-center gap-1.5 rounded-md font-medium select-none disabled:opacity-50 disabled:pointer-events-none",
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
