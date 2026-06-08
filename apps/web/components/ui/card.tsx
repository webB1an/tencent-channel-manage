import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, padding = "md", bordered = true, ...rest }: HTMLAttributes<HTMLDivElement> & { padding?: "none" | "sm" | "md" | "lg"; bordered?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-bg-card",
        bordered && "border border-border",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        className
      )}
      {...rest}
    />
  );
}
