import { cn } from "@/lib/cn";

export function Skeleton({ width, height = 16, rounded = "md", className }: { width?: number | string; height?: number | string; rounded?: "sm" | "md" | "lg" | "pill"; className?: string }) {
  return (
    <span
      className={cn("inline-block animate-pulse bg-surface-container", rounded === "sm" && "rounded-sm", rounded === "md" && "rounded", rounded === "lg" && "rounded-lg", rounded === "pill" && "rounded-pill", className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}
