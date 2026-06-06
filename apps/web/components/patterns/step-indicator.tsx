import { cn } from "@/lib/cn";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-pill text-xs font-semibold",
                done && "bg-primary text-white",
                active && "bg-primary text-white",
                !done && !active && "bg-border text-text-3"
              )}
            >
              {i + 1}
            </span>
            <span className={cn("text-sm", active || done ? "text-text" : "text-text-3")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < current ? "bg-primary" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
