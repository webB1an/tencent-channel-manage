import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, padding = "md", ...rest }: HTMLAttributes<HTMLDivElement> & { padding?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-card",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        className
      )}
      {...rest}
    />
  );
}
