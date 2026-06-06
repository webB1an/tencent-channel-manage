import { Card } from "@/components/ui/card";
import { StatusDot, type StatusDotStatus } from "@/components/ui/status-dot";

export function StatCard({ label, value, hint, status }: { label: string; value: React.ReactNode; hint?: string; status?: StatusDotStatus }) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-text-2">
        {status && <StatusDot status={status} size="sm" />}
        <span>{label}</span>
      </div>
      <div className="text-4xl tabular text-text">{value}</div>
      {hint && <div className="text-xs text-text-3">{hint}</div>}
    </Card>
  );
}
