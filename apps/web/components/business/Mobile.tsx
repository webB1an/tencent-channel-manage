"use client";

import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Empty, NavBar, Tag } from "antd-mobile";
import type { Account, Channel, ExecutionRecord, ScheduledTask, TaskTemplate } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 -mx-3 mb-3 border-b border-line bg-paper/95 backdrop-blur">
      <NavBar
        back={backHref ? "返回" : null}
        onBack={() => (backHref ? router.push(backHref) : router.back())}
        right={action}
      >
        <div className="truncate">
          <span className="text-h2 text-ink">{title}</span>
          {subtitle && <p className="truncate text-mini font-normal text-ink-3">{subtitle}</p>}
        </div>
      </NavBar>
    </div>
  );
}

export function BottomActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-line bg-paper-2/96 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
      {children}
    </div>
  );
}

export function StatusTag({ status }: { status: string }) {
  const color =
    ["normal", "enabled", "success", "ACTIVE"].includes(status) ? "success" :
    ["expired", "failed", "error", "INVALID", "REVOKED"].includes(status) ? "danger" :
    "warning";
  const label: Record<string, string> = {
    normal: "正常",
    expired: "已失效",
    running: "执行中",
    error: "异常",
    enabled: "启用",
    disabled: "停用",
    success: "成功",
    failed: "失败",
    pending: "等待中",
    account: "账号级",
    channel: "频道级",
  };
  return <Tag color={color} round={false}>{label[status] ?? status}</Tag>;
}

export function TokenText({ tail }: { tail?: string }) {
  return <span className="font-mono tabular text-ink-2">tk_****{tail || "----"}</span>;
}

export function EmptyPanel({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="surface rounded-lg px-4 py-8 text-center">
      <Empty description={<span className="text-ink-2">{title}</span>} />
      {hint && <p className="mx-auto mt-1 max-w-[240px] text-small text-ink-3">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AccountCard({ account, onDelete }: { account: Account; onDelete?: () => void }) {
  return (
    <Card className="adm-card-mobile">
      <Link href={`/accounts/${account.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-mini text-ink-3">QQ：{account.qq}</p>
            <h2 className="mt-1 truncate text-h2 text-ink">{account.nickname || "未命名账号"}</h2>
          </div>
          <StatusTag status={account.status} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-small">
          <Info label="Token" value={<TokenText tail={account.tokenTail} />} />
          <Info label="频道" value={`${account.channelCount ?? 0}`} />
          <Info label="未完成任务" value={`${account.pendingTaskCount ?? 0}`} />
          <Info label="最近运行" value={account.lastRunAt ? shortDate(account.lastRunAt) : "暂无"} />
        </dl>
      </Link>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
        <Link href={`/accounts/${account.id}`} className="block"><Button block size="small" color="primary" fill="outline">详情</Button></Link>
        <Link href={`/accounts/${account.id}/edit`} className="block"><Button block size="small" fill="outline">编辑</Button></Link>
        <Button size="small" color="danger" fill="none" onClick={onDelete}>删除</Button>
      </div>
    </Card>
  );
}

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link href={`/accounts/${channel.accountId}/channels/${channel.id}`} className="block">
      <Card className="adm-card-mobile">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-h2 text-ink">{channel.name}</h3>
            <p className="mt-1 text-mini text-ink-3">ID：{channel.channelId}</p>
          </div>
          <span className="text-small text-ink-3">进入 →</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-small">
          <Info label="状态" value="正常" />
          <Info label="板块" value={`${channel.sectionCount ?? 0}`} />
          <Info label="任务" value={`${channel.scheduledTaskCount ?? 0}`} />
        </div>
      </Card>
    </Link>
  );
}

export function TaskTemplateCard({ template, selected, onClick }: { template: TaskTemplate; selected?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full text-left", selected && "task-selected")}>
      <Card className={cn("adm-card-mobile transition-colors", selected && "border-accent bg-accent-soft")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-h3 text-ink">{template.name}</h3>
            <p className="mt-1 text-small text-ink-3">{template.description}</p>
          </div>
          <StatusTag status={template.targetLevel} />
        </div>
      </Card>
    </button>
  );
}

export function ScheduledTaskCard({ task }: { task: ScheduledTask }) {
  return (
    <Link href={`/tasks/schedules/${task.id}`} className="block">
      <Card className="adm-card-mobile">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-h2 text-ink">{task.name || task.taskType}</h3>
            <p className="mt-1 text-small text-ink-3">{task.targetLevel === "account" ? "账号级任务" : "频道级任务"} · {task.nextRunAt || "立即"}</p>
          </div>
          <StatusTag status={task.status} />
        </div>
      </Card>
    </Link>
  );
}

export function ExecutionRecordCard({ record }: { record: ExecutionRecord }) {
  return (
    <Link href={`/tasks/records/${record.id}`} className="block">
      <Card className="adm-card-mobile">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-h2 text-ink">{record.taskName || record.taskType}</h3>
            <p className="mt-1 text-small text-ink-3">{record.accountSnapshot.nickname || record.accountSnapshot.qq} · {record.channelSnapshot?.name || "全账号"}</p>
            <p className="mt-1 text-mini text-ink-3">{record.startedAt ? shortDate(record.startedAt) : "暂无时间"}</p>
          </div>
          <StatusTag status={record.status} />
        </div>
      </Card>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-paper px-3 py-2">
      <dt className="text-mini text-ink-3">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return <label className="mb-1.5 block text-small font-semibold text-ink">{children}{required && <span className="ml-0.5 text-risk-high">*</span>}</label>;
}

export function Message({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  return <p className={cn("rounded-lg px-3 py-2 text-small", kind === "ok" ? "bg-risk-low/10 text-risk-low" : "bg-risk-high/10 text-risk-high")}>{children}</p>;
}
