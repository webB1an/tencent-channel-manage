import { cn } from "@/lib/cn";

type Status = "success" | "warning" | "danger" | "neutral" | "primary" | "info";
export type StatusDotStatus = Status;

const colorClass: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-ink-muted",
  primary: "bg-primary",
  info: "bg-info",
};

export function StatusDot({ status, size = "md", className }: { status: StatusDotStatus; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block flex-shrink-0 rounded-full",
        colorClass[status],
        size === "sm" && "h-1.5 w-1.5",
        size === "md" && "h-2 w-2",
        size === "lg" && "h-2.5 w-2.5",
        className
      )}
      aria-hidden
    />
  );
}
