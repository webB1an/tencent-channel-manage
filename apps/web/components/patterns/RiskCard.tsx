"use client";

import type { InspectionResultView } from "@tcm/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

function riskTone(level: string): BadgeTone {
  if (level === "HIGH" || level === "CRITICAL") return "riskHigh";
  if (level === "MEDIUM") return "riskMid";
  return "riskLow";
}

function riskBarColor(level: string): string {
  if (level === "HIGH" || level === "CRITICAL") return "bg-risk-high";
  if (level === "MEDIUM") return "bg-risk-mid";
  return "bg-risk-low";
}

function statusLabel(s: string): string {
  if (s === "PROCESSED") return "已处理";
  if (s === "IGNORED") return "已忽略";
  return "待处理";
}

function riskLabel(level: string): string {
  if (level === "CRITICAL") return "CRITICAL";
  return level;
}

export interface RiskCardProps {
  inspection: InspectionResultView;
  onIgnore: () => void;
  onProcessed: () => void;
  onDelete: () => void;
  onMute: () => void;
}

export function RiskCard({ inspection: i, onIgnore, onProcessed, onDelete, onMute }: RiskCardProps) {
  const isHigh = i.riskLevel === "HIGH" || i.riskLevel === "CRITICAL";
  return (
    <article
      className={cn(
        "surface rounded-xl p-4 relative",
        isHigh && "risk-pulse",
      )}
    >
      <span
        className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r", riskBarColor(i.riskLevel))}
        aria-hidden
      />
      <div className="flex items-center justify-between pl-2">
        <Badge tone={riskTone(i.riskLevel)} uppercase>
          {riskLabel(i.riskLevel)}
        </Badge>
        <span className="text-micro text-ink-3">{formatRelativeTime(i.createdAt)}</span>
      </div>
      <h3 className="mt-3 pl-2 text-h3 text-ink truncate">{i.title || "未命名帖子"}</h3>
      <p className="mt-1 pl-2 text-small text-ink-2 line-clamp-2">{i.content || i.reason}</p>
      <p className="mt-2 pl-2 text-micro text-ink-3">
        作者：{i.authorName ?? "未知"} · 赞 {i.likeCount} · 评论 {i.commentCount}
      </p>
      <div className="mt-3 mx-2 rounded-md bg-paper-2 px-3 py-2 text-small text-ink flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime shrink-0" aria-hidden />
        <span>AI：{i.reason}</span>
      </div>
      <div className="mt-3 pl-2 grid grid-cols-2 gap-2">
        <button onClick={onIgnore} className="tap h-10 rounded-lg bg-paper-sunken text-small text-ink-2 hover:bg-paper">
          忽略
        </button>
        <button onClick={onProcessed} className="tap h-10 rounded-lg bg-accent-soft text-small font-semibold text-accent">
          {statusLabel("PROCESSED")}
        </button>
        <button onClick={onDelete} className="tap h-10 rounded-lg text-small text-risk-high hover:bg-risk-high/10">
          删除
        </button>
        <button onClick={onMute} className="tap h-10 rounded-lg text-small text-risk-mid hover:bg-risk-mid/10">
          禁言
        </button>
      </div>
    </article>
  );
}
