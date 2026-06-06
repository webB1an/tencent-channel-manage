"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, List, Skeleton, Toast } from "antd-mobile";
import { channelService, executionService, taskService, type Channel, type ExecutionRecord, type ScheduledTask, type Section } from "@/lib/domain";
import { EmptyPanel, ExecutionRecordCard, PageHeader, ScheduledTaskCard } from "@/components/business/Mobile";

export default function ChannelDetailPage({ params }: { params: { accountId: string; channelId: string } }) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [c, ss, allTasks, allRecords] = await Promise.all([
        channelService.getChannelDetail(params.accountId, params.channelId),
        channelService.getSectionsByChannel(params.accountId, params.channelId),
        taskService.getScheduledTasks(),
        executionService.getExecutionRecords(),
      ]);
      setChannel(c);
      setSections(ss);
      setTasks(allTasks.filter((task) => task.channelId === params.channelId || task.sectionIds.includes(params.channelId)));
      setRecords(allRecords.filter((record) => record.channelId === params.channelId).slice(0, 3));
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }, [params.accountId, params.channelId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function syncSections() {
    setBusy(true);
    try {
      const res = await channelService.refreshSectionsByChannel(params.accountId, params.channelId);
      Toast.show({ content: `已刷新 ${res.count} 个板块` });
      await refresh();
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad">
      <PageHeader title="频道详情" backHref={`/accounts/${params.accountId}`} />
      {loading ? (
        <Skeleton.Paragraph lineCount={8} animated />
      ) : !channel ? (
        <EmptyPanel title="频道不存在" />
      ) : (
        <>
          <Card className="adm-card-mobile">
            <h2 className="text-h2 text-ink">{channel.name}</h2>
            <p className="mt-2 text-small text-ink-3">ID：{channel.channelId}</p>
            <p className="mt-1 text-small text-ink-3">状态：正常</p>
          </Card>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h2 text-ink">板块列表</h2>
              <Button size="small" color="primary" fill="none" loading={busy} onClick={syncSections}>刷新板块</Button>
            </div>
            {sections.length === 0 ? <EmptyPanel title="暂无板块" hint="频道无板块时任务只能选择全频道" /> : (
              <List className="rounded-lg">
                {sections.map((section) => <List.Item key={section.id} description={section.sectionId}>{section.name}</List.Item>)}
              </List>
            )}
          </section>

          <section className="mt-5">
            <h2 className="mb-3 text-h2 text-ink">关联定时任务摘要</h2>
            {tasks.length === 0 ? <EmptyPanel title="暂无关联定时任务" hint="任务只能从任务中心创建" /> : (
              <ul className="space-y-3">{tasks.slice(0, 3).map((task) => <li key={task.id}><ScheduledTaskCard task={task} /></li>)}</ul>
            )}
          </section>

          <section className="mt-5">
            <h2 className="mb-3 text-h2 text-ink">最近执行记录</h2>
            {records.length === 0 ? <EmptyPanel title="暂无执行记录" /> : (
              <ul className="space-y-3">{records.map((record) => <li key={record.id}><ExecutionRecordCard record={record} /></li>)}</ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
