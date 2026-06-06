import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatShortDate } from "@/lib/utils";
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
        <p className="text-xs text-text-3">{record.startedAt ? formatShortDate(record.startedAt) : "暂无时间"}</p>
      </Card>
    </Link>
  );
}
