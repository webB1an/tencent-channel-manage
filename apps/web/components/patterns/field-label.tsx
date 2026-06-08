import { cn } from "@/lib/cn";

export function FieldLabel({ children, required, htmlFor, optional, className }: { children: React.ReactNode; required?: boolean; htmlFor?: string; optional?: boolean; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 flex items-baseline gap-1 text-[13px] font-medium text-ink", className)}>
      <span>{children}</span>
      {required && <span className="text-danger">*</span>}
      {optional && <span className="text-ink-faint">（选填）</span>}
    </label>
  );
}
