import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  current: number;
  total: number;
  label?: string;
  /** "numbered" shows circles with numbers, "bar" shows segmented progress bar */
  variant?: "bar" | "numbered";
}

export function StepIndicator({ current, total, label, variant = "numbered" }: StepIndicatorProps) {
  if (variant === "bar") {
    const pct = Math.min(100, Math.max(0, (current / total) * 100));
    return (
      <div className="space-y-2">
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
        </div>
        {label && (
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary">第 {current}/{total} 步</span>
            {label !== "progress" && <span className="text-ink-muted">{label}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <ol className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={idx} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-primary text-white",
                active && "bg-primary text-white ring-4 ring-primary-soft",
                !done && !active && "bg-surface-container text-ink-faint"
              )}
            >
              {done ? "✓" : idx}
            </span>
            {i < total - 1 && (
              <span className={cn("h-px flex-1 transition-colors", idx < current ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
