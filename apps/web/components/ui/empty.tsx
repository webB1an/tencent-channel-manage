import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export function Empty({ icon = "info", title, hint, action, className }: { icon?: IconName; title: string; hint?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-ink-muted">
        <Icon name={icon} size={40} />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-[13px] text-ink-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
