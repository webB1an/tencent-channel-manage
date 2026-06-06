import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { ScheduledTask } from "@/lib/domain";

export function ScheduledTaskCard({ task }: { task: ScheduledTask }) {
  return (
    <Link href={`/tasks/schedules/${task.id}`} className="block">
      <Card className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-2xl text-text">{task.name || task.taskType}</h3>
          <p className="mt-1 text-sm text-text-2">{task.targetLevel === "account" ? "账号级任务" : "频道级任务"} · {task.nextRunAt || "立即"}</p>
        </div>
        <StatusBadge status={task.status} />
      </Card>
    </Link>
  );
}
