import { cn } from "@/lib/cn";

export function Skeleton({ width, height = 16, rounded = "sm", className }: { width?: number | string; height?: number | string; rounded?: "sm" | "md" | "pill"; className?: string }) {
  return (
    <span
      className={cn("inline-block bg-bg-page align-middle", rounded === "sm" && "rounded-sm", rounded === "md" && "rounded-md", rounded === "pill" && "rounded-pill", className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}
