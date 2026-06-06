"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Toast } from "@/components/ui/toast";
import { PageHeader, EmptyState, TaskTemplateCard, ScheduledTaskCard, ExecutionRecordCard } from "@/components/patterns";
import { executionService, taskService, type ExecutionRecord, type ScheduledTask, type TaskTemplate } from "@/lib/domain";

type View = "templates" | "schedules" | "records";
const items = [
  { key: "templates", label: "任务模板" },
  { key: "schedules", label: "定时任务" },
  { key: "records", label: "执行记录" },
];

export default function TasksPage() {
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
      .then(([tpl, scheduled, runs]) => { setTemplates(tpl); setTasks(scheduled); setRecords(runs); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="任务中心"
        action={<Link href="/tasks/new"><Button size="sm">＋ 新建</Button></Link>}
      />
      <Tabs value={view} onChange={setView} items={items} />
      <div className="mt-3">
        {loading ? (
          <Skeleton height={200} className="block" />
        ) : view === "templates" ? (
          <ul className="space-y-3">
            {templates.map((t) => <li key={t.type}><TaskTemplateCard template={t} /></li>)}
          </ul>
        ) : view === "schedules" ? (
          tasks.length === 0 ? <EmptyState title="暂无定时任务" hint="从任务中心新建一个" action={<Link href="/tasks/new"><Button>新建任务</Button></Link>} /> : (
            <ul className="space-y-3">{tasks.map((t) => <li key={t.id}><ScheduledTaskCard task={t} /></li>)}</ul>
          )
        ) : records.length === 0 ? <EmptyState title="暂无执行记录" hint="执行后会生成记录" /> : (
          <ul className="space-y-3">{records.map((r) => <li key={r.id}><ExecutionRecordCard record={r} /></li>)}</ul>
        )}
      </div>
    </>
  );
}
