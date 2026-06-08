import { Card } from "@/components/ui/card";
import { StatusDot, type StatusDotStatus } from "@/components/ui/status-dot";

export function StatCard({ label, value, hint, status }: { label: string; value: React.ReactNode; hint?: string; status?: StatusDotStatus }) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2 text-[12px] text-ink-variant">
        {status && <StatusDot status={status} size="sm" />}
        <span>{label}</span>
      </div>
      <div className="font-display text-[28px] font-semibold leading-none tabular text-ink">{value}</div>
      {hint && <div className="text-[11px] text-ink-muted">{hint}</div>}
    </Card>
  );
}
