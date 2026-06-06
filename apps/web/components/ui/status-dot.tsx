import { cn } from "@/lib/cn";

type Status = "success" | "warning" | "danger" | "neutral" | "primary";
export type StatusDotStatus = Status;
const colorClass: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-text-3",
  primary: "bg-primary",
};

export function StatusDot({ status, size = "md", className }: { status: StatusDotStatus; size?: "sm" | "md"; className?: string }) {
  return <span className={cn("inline-block rounded-full", colorClass[status], size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", className)} aria-hidden />;
}
