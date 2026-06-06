import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function InfoTile({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md bg-bg-page px-3 py-2", className)}>
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-text">{value}</dd>
    </div>
  );
}
