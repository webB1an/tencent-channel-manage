"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FieldLabel, StepIndicator } from "@/components/patterns";
import { accountService, taskService, type Account, type ScheduledTask } from "@/lib/domain";
import { formatTime } from "@/lib/utils";

export default function EditScheduledTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [scheduleType, setScheduleType] = useState<"daily" | "once">("daily");
  const [scheduleAt, setScheduleAt] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState("");
  const accountIdFieldId = useId();
  const scheduleTypeFieldId = useId();
  const scheduleAtFieldId = useId();

  useEffect(() => {
    Promise.all([taskService.getScheduledTask(params.id), accountService.getAccountList()])
      .then(([t, acc]) => {
        if (!t) return;
        setTask(t);
        setAccounts(acc);
        setAccountId(t.accountId);
        if (t.scheduleConfig) {
          setScheduleType(t.scheduleConfig.type === "once" ? "once" : "daily");
          setScheduleAt(mergeDateAndTime(t.scheduleConfig.time));
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
        scheduleConfig: {
          type: scheduleType,
          time: formatTime(scheduleAt),
          runAt: scheduleType === "once" ? scheduleAt.toISOString() : undefined,
        },
      });
      Toast.show({ content: "任务已更新", type: "success" });
      router.replace(`/tasks/schedules/${task.id}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="编辑任务" />
        <main className="page-shell space-y-4">
          <Skeleton height={300} className="block rounded-lg" />
        </main>
      </>
    );
  }

  if (!task) {
    return (
      <>
        <TopBar title="编辑任务" />
        <main className="page-shell">
          <Card padding="md" className="text-center text-ink-muted">任务不存在或已删除</Card>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="编辑任务" />

      <main className="page-shell space-y-5">
        <section className="space-y-2">
          <StepIndicator current={1} total={1} variant="bar" />
          <p className="text-[12px] font-medium text-primary">编辑任务配置</p>
        </section>

        <Card padding="md" className="space-y-4">
          <div>
            <FieldLabel htmlFor={accountIdFieldId} required>执行账号</FieldLabel>
            <Select
              id={accountIdFieldId}
              value={accountId}
              onChange={setAccountId}
              options={accounts.map((a) => ({ label: a.nickname || a.qq, value: a.id }))}
              title="选择执行账号"
              placeholder="请选择执行账号"
            />
          </div>
          <div>
            <FieldLabel>执行方式</FieldLabel>
            <p className="text-[14px] text-ink-variant">定时执行</p>
          </div>
          <div>
            <FieldLabel htmlFor={scheduleTypeFieldId}>定时规则</FieldLabel>
            <Select
              id={scheduleTypeFieldId}
              value={scheduleType}
              onChange={(v) => setScheduleType(v as "daily" | "once")}
              options={[
                { label: "每天", value: "daily" },
                { label: "单次", value: "once" },
              ]}
            />
          </div>
          <div>
            <FieldLabel htmlFor={scheduleAtFieldId}>
              {scheduleType === "daily" ? "每日执行时间" : "执行日期和时间"}
            </FieldLabel>
            <DatePicker
              id={scheduleAtFieldId}
              value={scheduleAt}
              onChange={setScheduleAt}
              mode={scheduleType === "daily" ? "time" : "datetime"}
            />
          </div>
        </Card>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-phone border-t border-border bg-bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur">
        <Button block size="lg" loading={busy} onClick={save} className="shadow-primary">
          <Icon name="check" size={18} />
          保存修改
        </Button>
      </div>
    </>
  );
}

function mergeDateAndTime(time: string | undefined): Date {
  const now = new Date();
  if (!time) return now;
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return now;
  const h = Math.min(23, Math.max(0, Number(m[1])));
  const min = Math.min(59, Math.max(0, Number(m[2])));
  now.setHours(h, min, 0, 0);
  return now;
}
