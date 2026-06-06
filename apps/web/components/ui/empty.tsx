import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Empty({ title, hint, action, className }: { title: string; hint?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <Icon name="info" size={48} className="text-text-3" />
      <p className="mt-3 text-md font-semibold text-text">{title}</p>
      {hint && <p className="mt-1 text-sm text-text-3">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
