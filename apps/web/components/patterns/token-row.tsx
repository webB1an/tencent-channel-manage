import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { StatusTag } from "@/components/ui/badge";

export function TokenRow({ name, token, status, onAction, actionLabel = "操作" }: { name: string; token: string; status?: { variant: "success" | "warning" | "danger" | "neutral" | "primary"; text: string }; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="flex min-h-[64px] items-center justify-between gap-3 rounded-lg border border-border bg-bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[14px] text-ink">
          <span className="truncate font-medium">{name}</span>
          {status && <StatusTag status={status.variant} label={status.text} dot />}
        </div>
        <div className={cn("mt-1 truncate font-mono text-xs text-ink-muted")}>{token}</div>
      </div>
      {onAction && <Button size="sm" variant="secondary" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
