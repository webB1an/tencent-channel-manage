"use client";

import type { TaskRunView, TaskView } from "@tcm/shared";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  INSPECTION: "频道巡检",
  HOT_SUMMARY: "每日热门",
};

type ScheduleFormatter = (t?: string | null) => string;

const SCHEDULE_LABEL: Record<string, ScheduleFormatter> = {
  DAILY: (t?: string | null) => `每日 · ${t ?? "23:30"}`,
  IMMEDIATE: (_?: string | null) => "立即任务",
};

const STATUS_TONE = {
  ACTIVE: "riskLow" as const,
  PAUSED: "outline" as const,
};

const RUN_STATUS_LABEL: Record<string, string> = {
  PENDING: "排队中",
  RUNNING: "运行中",
  SUCCESS: "成功",
  FAILED: "失败",
  CANCELED: "已取消",
};

export interface TaskCardProps {
  task: TaskView;
  lastRun?: TaskRunView;
  onTrigger: () => void;
  busy?: boolean;
}

export function TaskCard({ task: t, lastRun, onTrigger, busy }: TaskCardProps) {
  const schedule = (SCHEDULE_LABEL[t.scheduleMode] as ScheduleFormatter)(t.defaultTime);

  return (
    <article className="surface rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h2 text-ink">{TYPE_LABEL[t.type] ?? t.type}</h3>
          <p className="mt-0.5 text-mini text-ink-3">
            {schedule} · {t.enabled ? "启用" : "停用"}
          </p>
        </div>
        <button
          onClick={onTrigger}
          disabled={busy}
          className="tap h-10 shrink-0 rounded-full bg-accent-soft px-3 text-small font-semibold text-accent hover:bg-paper-sunken disabled:opacity-60"
        >
          {busy ? "排队中..." : "运行一次"}
        </button>
      </div>
      {lastRun && (
        <div className="mt-3 pt-3 border-t border-line flex items-center gap-2 text-micro text-ink-3">
          <Badge tone={t.status === "ACTIVE" ? STATUS_TONE.ACTIVE : STATUS_TONE.PAUSED} uppercase>
            {t.status}
          </Badge>
          <span>最近：{RUN_STATUS_LABEL[lastRun.status] ?? lastRun.status}</span>
          <span>·</span>
          <span>{formatRelativeTime(lastRun.createdAt)}</span>
        </div>
      )}
    </article>
  );
}
