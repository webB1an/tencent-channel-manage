import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TokenRow({ name, token, status, onAction, actionLabel = "操作" }: { name: string; token: string; status?: { variant: "success" | "warning" | "danger" | "neutral"; text: string }; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-border bg-bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-md text-text">
          <span className="truncate">{name}</span>
          {status && <Badge variant={status.variant} text={status.text} />}
        </div>
        <div className={cn("mt-1 truncate font-mono text-xs text-text-3")}>{token}</div>
      </div>
      {onAction && <Button size="sm" variant="ghost" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
