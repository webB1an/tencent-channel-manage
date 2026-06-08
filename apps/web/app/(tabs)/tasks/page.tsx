"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import {
  EmptyState,
  TaskTemplateCard,
  ScheduledTaskCard,
  ExecutionRecordCard,
  StatTile,
} from "@/components/patterns";
import {
  executionService,
  taskService,
  type ExecutionRecord,
  type ScheduledTask,
  type TaskTemplate,
} from "@/lib/domain";

type View = "templates" | "schedules" | "records";
const items = [
  { key: "templates", label: "任务模板" },
  { key: "schedules", label: "定时任务" },
  { key: "records", label: "执行记录" },
];

export default function TasksPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("templates");
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      taskService.getTaskTemplates(),
      taskService.getScheduledTasks(),
      executionService.getExecutionRecords(),
    ])
      .then(([tpl, scheduled, runs]) => {
        setTemplates(tpl);
        setTasks(scheduled);
        setRecords(runs);
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const activeTasks = tasks.filter((t) => t.status === "enabled").length;
  const successRate = records.length
    ? Math.round((records.filter((r) => r.status === "success").length / records.length) * 100)
    : 0;
  const failedRecords = records.filter((r) => r.status === "failed").length;

  return (
    <>
      <TopBar
        title="任务中心"
        actions={[
          { icon: <Icon name="search" size={20} />, onClick: () => Toast.show({ content: "搜索" }), label: "搜索" },
          { icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多" }), label: "更多" },
        ]}
      />

      <div className="sticky top-14 z-10 -mt-px border-b border-border bg-bg-page">
        <div className="px-4 pt-3">
          <Link href="/tasks/new">
            <Button block size="lg" className="shadow-primary">
              <Icon name="plus" size={18} />
              新建任务
            </Button>
          </Link>
        </div>
        <div className="px-4 pt-2">
          <Tabs value={view} onChange={(v) => setView(v as View)} items={items} />
        </div>
      </div>

      <main className="page-shell space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton height={120} className="block rounded-lg" />
            <Skeleton height={120} className="block rounded-lg" />
          </div>
        ) : view === "templates" ? (
          templates.length === 0 ? (
            <EmptyState icon="book-open" title="暂无任务模板" />
          ) : (
            <ul className="space-y-3">
              {templates.map((tpl) => (
                <li key={tpl.type}>
                  <TaskTemplateCard
                    template={tpl}
                    onClick={() => router.push(`/tasks/new?type=${tpl.type}`)}
                  />
                </li>
              ))}
            </ul>
          )
        ) : view === "schedules" ? (
          tasks.length === 0 ? (
            <EmptyState
              icon="calendar"
              title="暂无定时任务"
              hint="从任务中心新建一个"
              action={
                <Link href="/tasks/new">
                  <Button>
                    <Icon name="plus" size={16} />
                    新建任务
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <StatTile label="启用任务" value={activeTasks} icon="check-circle" tone="success" />
                <StatTile label="失败记录" value={failedRecords} icon="alert-circle" tone={failedRecords > 0 ? "danger" : "primary"} />
              </div>
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <ScheduledTaskCard
                      task={t}
                      onToggle={() =>
                        t.status === "enabled"
                          ? taskService.disableScheduledTask(t.id).then(() => {
                              Toast.show({ content: "已停用" });
                              taskService.getScheduledTasks().then(setTasks);
                            })
                          : taskService.enableScheduledTask(t.id).then(() => {
                              Toast.show({ content: "已启用" });
                              taskService.getScheduledTasks().then(setTasks);
                            })
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : records.length === 0 ? (
          <EmptyState icon="activity" title="暂无执行记录" hint="执行后会生成记录" />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="执行总数" value={records.length} icon="bar-chart" tone="primary" />
              <StatTile
                label="成功率"
                value={records.length ? `${successRate}%` : "—"}
                icon="trending-up"
                tone={successRate >= 95 ? "success" : successRate >= 80 ? "warning" : "danger"}
              />
            </div>
            <ul className="space-y-3">
              {records.map((r) => (
                <li key={r.id}>
                  <ExecutionRecordCard record={r} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}
