import { cn } from "@/lib/cn";

type Variant = "primary" | "success" | "warning" | "danger" | "neutral" | "info";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-container text-ink-variant",
  info: "bg-info-soft text-info",
};

export function Badge({ variant = "neutral", text, className }: { variant?: Variant; text: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[20px] items-center rounded-sm px-1.5 text-[11px] font-medium leading-none",
        variantClass[variant],
        className
      )}
    >
      {text}
    </span>
  );
}

export function StatusTag({ status, label, dot, className }: { status: Variant; label: React.ReactNode; dot?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 rounded-sm border px-1.5 text-[11px] font-semibold leading-none",
        status === "success" && "bg-success-soft text-success border-success/30",
        status === "warning" && "bg-warning-soft text-warning border-warning/30",
        status === "danger" && "bg-danger-soft text-danger border-danger/30",
        status === "primary" && "bg-primary-soft text-primary border-primary/30",
        status === "info" && "bg-info-soft text-info border-info/30",
        status === "neutral" && "bg-surface-container text-ink-variant border-border",
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "success" && "bg-success",
            status === "warning" && "bg-warning",
            status === "danger" && "bg-danger",
            status === "primary" && "bg-primary",
            status === "info" && "bg-info",
            status === "neutral" && "bg-ink-muted"
          )}
        />
      )}
      {label}
    </span>
  );
}
