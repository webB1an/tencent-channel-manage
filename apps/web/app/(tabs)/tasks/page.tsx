"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Skeleton, Tabs, Toast } from "antd-mobile";
import { executionService, taskService, type ExecutionRecord, type ScheduledTask, type TaskTemplate } from "@/lib/domain";
import { EmptyPanel, ExecutionRecordCard, PageHeader, ScheduledTaskCard, TaskTemplateCard } from "@/components/business/Mobile";

export default function TasksPage() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const [tpl, scheduled, runs] = await Promise.all([
        taskService.getTaskTemplates(),
        taskService.getScheduledTasks(),
        executionService.getExecutionRecords(),
      ]);
      setTemplates(tpl);
      setTasks(scheduled);
      setRecords(runs);
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="page-pad">
      <PageHeader
        title="任务中心"
        action={<Link href="/tasks/new"><Button size="small" color="primary">新建任务</Button></Link>}
      />

      {loading ? (
        <Skeleton.Paragraph lineCount={8} animated />
      ) : (
        <Tabs defaultActiveKey="templates">
          <Tabs.Tab title="任务模板" key="templates">
            <section className="mt-3 space-y-3">
              {templates.map((template) => <TaskTemplateCard key={template.type} template={template} />)}
            </section>
          </Tabs.Tab>
          <Tabs.Tab title="定时任务" key="schedules">
            <section className="mt-3">
              {tasks.length === 0 ? <EmptyPanel title="暂无定时任务" hint="从任务中心新建一个定时任务" action={<Link href="/tasks/new"><Button color="primary">新建任务</Button></Link>} /> : (
                <ul className="space-y-3">{tasks.map((task) => <li key={task.id}><ScheduledTaskCard task={task} /></li>)}</ul>
              )}
            </section>
          </Tabs.Tab>
          <Tabs.Tab title="执行记录" key="records">
            <section className="mt-3">
              {records.length === 0 ? <EmptyPanel title="暂无执行记录" hint="立即执行或定时执行后会生成记录" /> : (
                <ul className="space-y-3">{records.map((record) => <li key={record.id}><ExecutionRecordCard record={record} /></li>)}</ul>
              )}
            </section>
          </Tabs.Tab>
        </Tabs>
      )}
    </main>
  );
}
