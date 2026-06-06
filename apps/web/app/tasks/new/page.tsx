"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Checkbox, DatePicker, Form, Input, List, Picker, Radio, Selector, Space, Steps, Toast } from "antd-mobile";
import { accountService, channelService, executionService, taskService, type Account, type Channel, type RangeType, type Section, type TaskTemplate } from "@/lib/domain";
import { BottomActionBar, EmptyPanel, PageHeader, TaskTemplateCard } from "@/components/business/Mobile";

export default function NewTaskPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [taskType, setTaskType] = useState("");
  const [accountId, setAccountId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [rangeType, setRangeType] = useState<RangeType>("all");
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<"immediate" | "schedule">("immediate");
  const [scheduleType, setScheduleType] = useState<"daily" | "once">("daily");
  const [scheduleAt, setScheduleAt] = useState(() => nextDefaultTime());
  const [topN, setTopN] = useState("10");
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => templates.find((t) => t.type === taskType), [templates, taskType]);
  const isChannelTask = template?.targetLevel === "channel";
  const canSubmit = Boolean(template && accountId && (!isChannelTask || channelId) && (rangeType !== "selectedSections" || sectionIds.length > 0));
  const accountName = accounts.find((a) => a.id === accountId)?.nickname || accounts.find((a) => a.id === accountId)?.qq || "请选择执行账号";
  const channelName = channels.find((c) => c.id === channelId)?.name || "请选择执行频道";

  useEffect(() => {
    Promise.all([taskService.getTaskTemplates(), accountService.getAccountList()])
      .then(([tpl, acc]) => {
        setTemplates(tpl);
        setAccounts(acc);
      })
      .catch((e) => Toast.show({ content: (e as Error).message }));
  }, []);

  useEffect(() => {
    if (!accountId) return;
    channelService.getChannelsByAccount(accountId)
      .then((rows) => {
        setChannels(rows);
        setChannelId("");
        setSections([]);
        setSectionIds([]);
      })
      .catch((e) => Toast.show({ content: (e as Error).message }));
  }, [accountId]);

  useEffect(() => {
    if (!accountId || !channelId) return;
    channelService.getSectionsByChannel(accountId, channelId)
      .then((rows) => {
        setSections(rows);
        setSectionIds([]);
        if (rows.length === 0) setRangeType("all");
      })
      .catch((e) => Toast.show({ content: (e as Error).message }));
  }, [accountId, channelId]);

  async function submit() {
    if (!template) return;
    if (!canSubmit) {
      Toast.show({ content: isChannelTask ? "请选择账号和频道" : "请选择账号" });
      return;
    }
    setBusy(true);
    try {
      if (template.type === "SYNC_CHANNELS") {
        await channelService.refreshChannels(accountId);
        Toast.show({ content: "频道同步任务已执行" });
        router.replace("/tasks");
        return;
      }
      const data = {
        taskType: template.type as "INSPECTION" | "HOT_SUMMARY",
        accountId,
        channelId,
        taskConfig: { topN: Number(topN) || 10, rangeType, sectionIds },
      };
      if (executionMode === "immediate") {
        await executionService.executeTaskImmediately(data);
        Toast.show({ content: "任务已提交执行" });
      } else {
        await taskService.createScheduledTask({
          ...data,
          scheduleConfig: {
            type: scheduleType,
            time: formatTime(scheduleAt),
            runAt: scheduleType === "once" ? scheduleAt.toISOString() : undefined,
          },
        });
        Toast.show({ content: "定时任务已创建" });
      }
      router.replace("/tasks");
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad pb-28">
      <PageHeader title="新建任务" backHref="/tasks" />
      <Steps current={step}>
        <Steps.Step title="类型" />
        <Steps.Step title="对象" />
        <Steps.Step title="配置" />
        <Steps.Step title="确认" />
      </Steps>

      {step === 0 && (
        <section className="mt-4 space-y-3">
          {templates.map((tpl) => (
            <TaskTemplateCard key={tpl.type} template={tpl} selected={taskType === tpl.type} onClick={() => setTaskType(tpl.type)} />
          ))}
        </section>
      )}

      {step === 1 && (
        <Card className="adm-card-mobile mt-4">
          <Form layout="vertical">
            <Form.Item label="执行账号" required>
              <Picker
                title="选择执行账号"
                columns={[accounts.map((a) => ({ label: `${a.nickname || a.qq} · ${a.status === "normal" ? "正常" : "异常"}`, value: a.id }))]}
                value={accountId ? [accountId] : []}
                onConfirm={(v) => setAccountId(String(v[0] ?? ""))}
              >
                {(_, actions) => (
                  <List.Item clickable onClick={actions.open} extra="选择">{accountName}</List.Item>
                )}
              </Picker>
            </Form.Item>
            {isChannelTask && (
              <Form.Item label="执行频道" required>
                {channels.length === 0 ? <EmptyPanel title="暂无频道" hint="请先在账号详情刷新频道" /> : (
                  <Picker
                    title="选择执行频道"
                    columns={[channels.map((c) => ({ label: c.name, value: c.id }))]}
                    value={channelId ? [channelId] : []}
                    onConfirm={(v) => setChannelId(String(v[0] ?? ""))}
                  >
                    {(_, actions) => (
                      <List.Item clickable onClick={actions.open} extra="选择">{channelName}</List.Item>
                    )}
                  </Picker>
                )}
              </Form.Item>
            )}
            {isChannelTask && (
              <Form.Item label="执行范围">
                <Selector
                  columns={2}
                  value={[rangeType]}
                  onChange={(v) => setRangeType((v[0] as RangeType) ?? "all")}
                  options={[
                    { label: "全频道", value: "all" },
                    { label: "指定板块", value: "selectedSections", disabled: sections.length === 0 },
                  ]}
                />
                {rangeType === "selectedSections" && (
                  <div className="mt-3 rounded-lg bg-paper p-3">
                    <Checkbox.Group value={sectionIds} onChange={(v) => setSectionIds(v.map(String))}>
                      <Space direction="vertical">
                        {sections.map((section) => <Checkbox key={section.id} value={section.id}>{section.name}</Checkbox>)}
                      </Space>
                    </Checkbox.Group>
                  </div>
                )}
              </Form.Item>
            )}
          </Form>
        </Card>
      )}

      {step === 2 && (
        <Card className="adm-card-mobile mt-4">
          <Form layout="vertical">
            <Form.Item label="执行方式">
              <Radio.Group value={executionMode} onChange={(v) => setExecutionMode(v as "immediate" | "schedule")}>
                <Space direction="vertical">
                  <Radio value="immediate">立即执行</Radio>
                  <Radio value="schedule" disabled={!template?.supportSchedule}>定时执行</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            {executionMode === "schedule" && (
              <>
                <Form.Item label="定时规则">
                  <Selector
                    columns={2}
                    value={[scheduleType]}
                    onChange={(v) => setScheduleType((v[0] as "daily" | "once") ?? "daily")}
                    options={[
                      { label: "每天", value: "daily" },
                      { label: "单次", value: "once" },
                    ]}
                  />
                </Form.Item>
                <Form.Item label={scheduleType === "daily" ? "每日执行时间" : "执行日期和时间"}>
                  <DatePicker
                    title={scheduleType === "daily" ? "选择每日执行时间" : "选择执行日期和时间"}
                    value={scheduleAt}
                    min={new Date()}
                    precision="minute"
                    onConfirm={setScheduleAt}
                  >
                    {(value, actions) => (
                      <List.Item clickable onClick={actions.open} extra="选择">
                        {scheduleType === "daily" ? formatTime(value ?? scheduleAt) : formatDateTime(value ?? scheduleAt)}
                      </List.Item>
                    )}
                  </DatePicker>
                </Form.Item>
              </>
            )}
            {template?.targetLevel === "channel" && (
              <Form.Item label={template.type === "HOT_SUMMARY" ? "汇总数量" : "扫描上限"}>
                <Input value={topN} onChange={setTopN} type="number" placeholder="10" />
              </Form.Item>
            )}
          </Form>
        </Card>
      )}

      {step === 3 && (
        <Card className="adm-card-mobile mt-4">
          <h2 className="mb-3 text-h2 text-ink">请确认以下任务配置</h2>
          <div className="space-y-2 text-small text-ink-2">
            <p>任务类型：{template?.name}</p>
            <p>执行账号：{accounts.find((a) => a.id === accountId)?.nickname || accountId}</p>
            {isChannelTask && <p>执行频道：{channels.find((c) => c.id === channelId)?.name || channelId}</p>}
            <p>执行范围：{isChannelTask ? (rangeType === "all" ? "全频道" : `指定板块：${sectionIds.length} 个`) : "全账号"}</p>
            <p>执行方式：{executionMode === "immediate" ? "立即执行" : scheduleType === "daily" ? `每天 ${formatTime(scheduleAt)}` : formatDateTime(scheduleAt)}</p>
          </div>
        </Card>
      )}

      <BottomActionBar>
        <div className="grid grid-cols-2 gap-3">
          <Button block size="large" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>返回修改</Button>
          {step < 3 ? (
            <Button block color="primary" size="large" disabled={step === 0 && !taskType} onClick={() => setStep((s) => Math.min(3, s + 1))}>下一步</Button>
          ) : (
            <Button block color="primary" size="large" loading={busy} disabled={!canSubmit} onClick={submit}>确认提交</Button>
          )}
        </div>
      </BottomActionBar>
    </main>
  );
}

function nextDefaultTime() {
  const d = new Date();
  d.setHours(23, 30, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDateTime(date: Date) {
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}
