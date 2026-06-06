import { Card } from "@/components/ui/Card";
import { NumberTicker } from "./NumberTicker";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 border",
        accent ? "bg-ink text-ink-inverse border-ink" : "bg-paper text-ink border-line",
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-micro tracking-[0.08em] uppercase",
            accent ? "text-ink-inverse/70" : "text-ink-3",
          )}
        >
          {label}
        </p>
        {accent && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />}
      </div>
      <p className="mt-2 text-d2 tabular leading-none">
        <NumberTicker value={value} />
      </p>
      <p className={cn("mt-2 text-micro", accent ? "text-ink-inverse/60" : "text-ink-3")}>{hint}</p>
    </div>
  );
}
