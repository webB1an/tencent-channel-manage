"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Radio } from "@/components/ui/radio";
import { FieldLabel } from "@/components/patterns";
import { accountService, taskService, type Account, type ScheduledTask } from "@/lib/domain";

export default function EditScheduledTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [executionMode, setExecutionMode] = useState<"immediate" | "schedule">("schedule");
  const [scheduleType, setScheduleType] = useState<"daily" | "once">("daily");
  const [scheduleAt, setScheduleAt] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    Promise.all([taskService.getScheduledTask(params.id), accountService.getAccountList()])
      .then(([t, acc]) => {
        if (!t) return;
        setTask(t);
        setAccounts(acc);
        setAccountId(t.accountId);
        if (t.scheduleConfig) {
          setScheduleType(t.scheduleConfig.type === "once" ? "once" : "daily");
          setExecutionMode("schedule");
        }
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function save() {
    if (!task) return;
    setBusy(true);
    try {
      await taskService.updateScheduledTask(task.id, {
        accountId,
        scheduleConfig: executionMode === "schedule" ? {
          type: scheduleType,
          time: scheduleAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }),
          runAt: scheduleType === "once" ? scheduleAt.toISOString() : undefined,
        } : undefined,
      });
      Toast.show({ content: "任务已更新", type: "success" });
      router.replace(`/tasks/schedules/${task.id}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!task) return <TopBar title="编辑任务" />;

  return (
    <>
      <TopBar title="编辑任务" />
      <main className="page-shell space-y-4">
        <Card className="space-y-4">
          <div>
            <FieldLabel required>执行账号</FieldLabel>
            <Select value={accountId} onChange={setAccountId} options={accounts.map((a) => ({ label: `${a.nickname || a.qq}`, value: a.id }))} title="选择执行账号" placeholder="请选择执行账号" />
          </div>
          <div>
            <FieldLabel>执行方式</FieldLabel>
            <div className="space-y-2">
              <Radio checked={executionMode === "schedule"} onChange={() => setExecutionMode("schedule")}>定时执行</Radio>
            </div>
          </div>
          <div>
            <FieldLabel>定时规则</FieldLabel>
            <Select value={scheduleType} onChange={(v) => setScheduleType(v as "daily" | "once")} options={[{ label: "每天", value: "daily" }, { label: "单次", value: "once" }]} />
          </div>
          <div>
            <FieldLabel>{scheduleType === "daily" ? "每日执行时间" : "执行日期和时间"}</FieldLabel>
            <DatePicker value={scheduleAt} onChange={setScheduleAt} mode={scheduleType === "daily" ? "time" : "datetime"} />
          </div>
        </Card>
        <Button block size="lg" loading={busy} onClick={save}>保存</Button>
      </main>
    </>
  );
}
