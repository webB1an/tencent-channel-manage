"use client";

import type { InspectionResultView } from "@tcm/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function riskTone(level: string): BadgeTone {
  if (level === "HIGH" || level === "CRITICAL") return "riskHigh";
  if (level === "MEDIUM") return "riskMid";
  return "riskLow";
}

function riskLabel(level: string): string {
  if (level === "CRITICAL") return "CRITICAL";
  return level;
}

export interface RiskCardCompactProps {
  inspection: InspectionResultView;
}

export function RiskCardCompact({ inspection: i }: RiskCardCompactProps) {
  return (
    <div className="rounded-md bg-paper-2 p-3 flex items-start gap-3">
      <Badge tone={riskTone(i.riskLevel)} uppercase className="shrink-0">
        {riskLabel(i.riskLevel)}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className={cn("text-small text-ink truncate")}>{i.title || "未命名帖子"}</p>
        <p className="mt-0.5 text-mini text-ink-3 line-clamp-1">{i.reason}</p>
        <p className="mt-1 text-micro text-ink-3">
          {i.authorName ?? "未知"} · 赞 {i.likeCount} · 评论 {i.commentCount}
        </p>
      </div>
    </div>
  );
}
