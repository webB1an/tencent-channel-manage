import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { TokenText } from "./token-text";
import type { Account } from "@/lib/domain";

export function AccountCard({ account, onDelete }: { account: Account; onDelete?: () => void }) {
  return (
    <Card className="space-y-3">
      <Link href={`/accounts/${account.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-3">QQ：{account.qq}</p>
            <h2 className="mt-1 truncate text-2xl text-text">{account.nickname || "未命名账号"}</h2>
          </div>
          <StatusBadge status={account.status} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Info label="Token" value={<TokenText tail={account.tokenTail} />} />
          <Info label="频道" value={`${account.channelCount ?? 0}`} />
          <Info label="未完成任务" value={`${account.pendingTaskCount ?? 0}`} />
          <Info label="最近运行" value={account.lastRunAt ? shortDate(account.lastRunAt) : "暂无"} />
        </dl>
      </Link>
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
        <Link href={`/accounts/${account.id}`}><Button block size="sm" variant="secondary">详情</Button></Link>
        <Link href={`/accounts/${account.id}/edit`}><Button block size="sm" variant="secondary">编辑</Button></Link>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-danger">删除</Button>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-bg-page px-3 py-2">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-text">{value}</dd>
    </div>
  );
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
