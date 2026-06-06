import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

const colorByLevel = { high: "bg-danger", mid: "bg-warning", low: "bg-primary" } as const;

export function RiskCard({ level, title, description, meta }: { level: "high" | "mid" | "low"; title: string; description: string; meta?: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden p-0">
      <span className={cn("absolute inset-y-0 left-0 w-1", colorByLevel[level])} aria-hidden />
      <div className="p-4 pl-5">
        <h4 className="text-md text-text">{title}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-text-2">{description}</p>
        {meta && <div className="mt-2 text-xs text-text-3">{meta}</div>}
      </div>
    </Card>
  );
}
