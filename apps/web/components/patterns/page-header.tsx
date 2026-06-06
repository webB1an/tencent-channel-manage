import { cn } from "@/lib/cn";

export function PageHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-3 py-4", className)}>
      <div className="min-w-0">
        <h1 className="text-4xl text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-text-2">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
