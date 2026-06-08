import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-container text-ink-variant",
};

export function IconBadge({ icon, tone = "neutral", size = "md", className }: { icon: IconName; tone?: Tone; size?: "sm" | "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-lg",
        toneClass[tone],
        size === "sm" && "h-7 w-7",
        size === "md" && "h-9 w-9",
        size === "lg" && "h-12 w-12",
        className
      )}
    >
      <Icon name={icon} size={size === "sm" ? 14 : size === "md" ? 18 : 22} />
    </span>
  );
}
