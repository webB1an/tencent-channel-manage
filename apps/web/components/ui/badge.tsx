import { cn } from "@/lib/cn";

type Variant = "primary" | "success" | "warning" | "danger" | "neutral";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-primary-soft text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-border text-text-2",
};

export function Badge({ variant = "neutral", text, className }: { variant?: Variant; text: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-[18px] items-center rounded-pill px-1.5 text-[11px] font-medium", variantClass[variant], className)}>
      {text}
    </span>
  );
}
