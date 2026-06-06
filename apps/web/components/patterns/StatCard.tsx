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
        "rounded-xl p-3.5 border",
        accent ? "bg-accent-soft text-ink border-accent/20" : "bg-paper-2 text-ink border-line",
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-micro",
            accent ? "text-accent" : "text-ink-3",
          )}
        >
          {label}
        </p>
        {accent && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />}
      </div>
      <p className="mt-2 text-d3 tabular leading-none">
        <NumberTicker value={value} />
      </p>
      <p className={cn("mt-2 text-micro", accent ? "text-accent/75" : "text-ink-3")}>{hint}</p>
    </div>
  );
}
