"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, DatePicker, Dialog, Form, Input, List, Toast } from "antd-mobile";
import { taskService, type ScheduledTask } from "@/lib/domain";
import { BottomActionBar, EmptyPanel, PageHeader } from "@/components/business/Mobile";

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [time, setTime] = useState(() => timeToDate("23:30"));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    taskService.getScheduledTaskDetail(params.id).then((detail) => {
      setTask(detail);
      setTime(timeToDate(detail?.scheduleConfig.time ?? "23:30"));
    }).catch((e) => Toast.show({ content: (e as Error).message }));
  }, [params.id]);

  async function save() {
    const ok = await Dialog.confirm({ content: "修改后将影响后续自动执行。确定保存？" });
    if (!ok) return;
    setBusy(true);
    try {
      await taskService.updateScheduledTask(params.id);
      Toast.show({ content: "修改已保存" });
      router.replace(`/tasks/schedules/${params.id}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad pb-28">
      <PageHeader title="编辑定时任务" backHref={`/tasks/schedules/${params.id}`} />
      {!task ? <EmptyPanel title="任务不存在" /> : (
        <Card className="adm-card-mobile">
          <Form layout="vertical">
            <Form.Item label="任务类型"><Input value={task.name || task.taskType} disabled /></Form.Item>
            <Form.Item label="执行账号"><Input value={task.accountId} disabled /></Form.Item>
            <Form.Item label="执行范围"><Input value={task.rangeType === "all" ? "全部" : "指定板块"} disabled /></Form.Item>
            <Form.Item label="每日执行时间">
              <DatePicker title="选择每日执行时间" value={time} precision="minute" onConfirm={setTime}>
                {(value, actions) => (
                  <List.Item clickable onClick={actions.open} extra="选择">{formatTime(value ?? time)}</List.Item>
                )}
              </DatePicker>
            </Form.Item>
          </Form>
        </Card>
      )}
      <BottomActionBar>
        <Button block color="primary" size="large" loading={busy} onClick={save}>保存修改</Button>
      </BottomActionBar>
    </main>
  );
}

function timeToDate(value: string) {
  const [hour = "23", minute = "30"] = value.split(":");
  const d = new Date();
  d.setHours(Number(hour), Number(minute), 0, 0);
  return d;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}
