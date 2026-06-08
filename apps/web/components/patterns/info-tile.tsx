import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function InfoTile({ label, value, className, emphasis }: { label: string; value: ReactNode; className?: string; emphasis?: boolean }) {
  return (
    <div className={cn("rounded border border-border-soft bg-surface-container-low px-3 py-2", className)}>
      <dt className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</dt>
      <dd className={cn("mt-0.5 truncate font-medium tabular", emphasis ? "text-primary" : "text-ink")}>{value}</dd>
    </div>
  );
}
