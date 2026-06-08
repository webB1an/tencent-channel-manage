import { cn } from "@/lib/cn";

export function PageHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-3 px-1 pb-4 pt-5", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-[28px] font-semibold leading-[1.15] text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-ink-variant">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
