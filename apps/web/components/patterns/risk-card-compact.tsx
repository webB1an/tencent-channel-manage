import { Card } from "@/components/ui/card";
import { StatusDot, type StatusDotStatus } from "@/components/ui/status-dot";

const statusByLevel: Record<"high" | "mid" | "low", StatusDotStatus> = { high: "danger", mid: "warning", low: "primary" };

export function RiskCardCompact({ level, title, meta }: { level: "high" | "mid" | "low"; title: string; meta?: React.ReactNode }) {
  return (
    <Card padding="sm" className="relative">
      <StatusDot status={statusByLevel[level]} className="absolute right-3 top-3" />
      <h4 className="pr-6 text-md text-text">{title}</h4>
      {meta && <div className="mt-1 text-xs text-text-3">{meta}</div>}
    </Card>
  );
}
