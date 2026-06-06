"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost" | "amberGhost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "tap inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 ease-out-quint disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-[0_10px_24px_-16px_rgb(var(--accent))] hover:bg-accent/92 active:bg-accent/88",
  secondary: "bg-paper-2 text-ink border border-line hover:border-line-strong hover:bg-paper",
  ghost: "text-ink hover:bg-accent-soft",
  danger: "bg-risk-high text-white hover:bg-risk-high/90",
  dangerGhost: "text-risk-high hover:bg-risk-high/10",
  amberGhost: "text-risk-mid hover:bg-risk-mid/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-small",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-5 text-h3",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, iconLeft, iconRight, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="font-mono text-current">···</span>
      ) : (
        <>
          {iconLeft}
          <span>{children}</span>
          {iconRight}
        </>
      )}
    </button>
  );
});
