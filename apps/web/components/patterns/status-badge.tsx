import { StatusTag } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const labelMap: Record<string, { text: string; tone: "success" | "danger" | "warning" | "primary" | "info" | "neutral" }> = {
  normal: { text: "Normal", tone: "success" },
  enabled: { text: "已启用", tone: "success" },
  success: { text: "成功", tone: "success" },
  ACTIVE: { text: "Active", tone: "success" },
  expired: { text: "已失效", tone: "danger" },
  failed: { text: "Failed", tone: "danger" },
  error: { text: "Error", tone: "danger" },
  INVALID: { text: "失效", tone: "danger" },
  REVOKED: { text: "撤销", tone: "danger" },
  running: { text: "执行中", tone: "info" },
  pending: { text: "等待中", tone: "warning" },
  disabled: { text: "停用", tone: "neutral" },
  // Channel / section status
  idle: { text: "Idle", tone: "warning" },
  active_status: { text: "Active", tone: "success" },
  stopped: { text: "Stopped", tone: "neutral" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status === "active" ? "active_status" : status;
  const m = labelMap[key] ?? { text: status, tone: "neutral" as const };
  return <StatusTag status={m.tone} label={m.text} dot className={cn("h-[20px] px-2 text-[10px] tracking-wider", className)} />;
}
