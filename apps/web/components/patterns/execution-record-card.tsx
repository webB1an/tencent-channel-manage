import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { ExecutionRecord } from "@/lib/domain";

export function ExecutionRecordCard({ record }: { record: ExecutionRecord }) {
  return (
    <Link href={`/tasks/records/${record.id}`} className="block">
      <Card className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl text-text">{record.taskName || record.taskType}</h3>
          <StatusBadge status={record.status} />
        </div>
        <p className="text-sm text-text-2">
          {record.accountSnapshot.nickname || record.accountSnapshot.qq} · {record.channelSnapshot?.name || "全账号"}
        </p>
        <p className="text-xs text-text-3">{record.startedAt ? shortDate(record.startedAt) : "暂无时间"}</p>
      </Card>
    </Link>
  );
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
