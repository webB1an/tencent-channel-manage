"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Radio } from "@/components/ui/radio";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { StepIndicator, TaskTemplateCard, EmptyState, FieldLabel } from "@/components/patterns";
import { accountService, channelService, executionService, taskService, type Account, type Channel, type RangeType, type Section, type TaskTemplate } from "@/lib/domain";

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
  const [scheduleAt, setScheduleAt] = useState<Date>(() => nextDefaultTime());
  const [topN, setTopN] = useState("10");
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => templates.find((t) => t.type === taskType), [templates, taskType]);
  const isChannelTask = template?.targetLevel === "channel";
  const canSubmit = Boolean(template && accountId && (!isChannelTask || channelId) && (rangeType !== "selectedSections" || sectionIds.length > 0));

  useEffect(() => {
    Promise.all([taskService.getTaskTemplates(), accountService.getAccountList()])
      .then(([tpl, acc]) => { setTemplates(tpl); setAccounts(acc); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, []);

  useEffect(() => {
    if (!accountId) return;
    channelService.getChannelsByAccount(accountId)
      .then((rows) => { setChannels(rows); setChannelId(""); setSections([]); setSectionIds([]); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, [accountId]);

  useEffect(() => {
    if (!accountId || !channelId) return;
    channelService.getSectionsByChannel(accountId, channelId)
      .then((rows) => { setSections(rows); setSectionIds([]); if (rows.length === 0) setRangeType("all"); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, [accountId, channelId]);

  async function submit() {
    if (!template) return;
    if (!canSubmit) { Toast.show({ content: isChannelTask ? "请选择账号和频道" : "请选择账号", type: "error" }); return; }
    setBusy(true);
    try {
      if (template.type === "SYNC_CHANNELS") {
        await channelService.refreshChannels(accountId);
        Toast.show({ content: "频道同步任务已执行", type: "success" });
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
        Toast.show({ content: "任务已提交执行", type: "success" });
      } else {
        await taskService.createScheduledTask({
          ...data,
          scheduleConfig: {
            type: scheduleType,
            time: formatTime(scheduleAt),
            runAt: scheduleType === "once" ? scheduleAt.toISOString() : undefined,
          },
        });
        Toast.show({ content: "定时任务已创建", type: "success" });
      }
      router.replace("/tasks");
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="新建任务" />
      <main className="page-shell space-y-4 pb-32">
        <StepIndicator steps={["类型", "对象", "配置", "确认"]} current={step} />

        {step === 0 && (
          <ul className="space-y-3">
            {templates.map((tpl) => (
              <li key={tpl.type}><TaskTemplateCard template={tpl} selected={taskType === tpl.type} onClick={() => setTaskType(tpl.type)} /></li>
            ))}
          </ul>
        )}

        {step === 1 && (
          <Card className="space-y-4">
            <div>
              <FieldLabel required>执行账号</FieldLabel>
              <Select
                value={accountId}
                onChange={setAccountId}
                options={accounts.map((a) => ({ label: `${a.nickname || a.qq} · ${a.status === "normal" ? "正常" : "异常"}`, value: a.id }))}
                title="选择执行账号"
                placeholder="请选择执行账号"
              />
            </div>
            {isChannelTask && (
              <div>
                <FieldLabel required>执行频道</FieldLabel>
                {channels.length === 0 ? <EmptyState title="暂无频道" hint="请先在账号详情刷新频道" /> : (
                  <Select value={channelId} onChange={setChannelId} options={channels.map((c) => ({ label: c.name, value: c.id }))} title="选择执行频道" placeholder="请选择执行频道" />
                )}
              </div>
            )}
            {isChannelTask && (
              <div>
                <FieldLabel>执行范围</FieldLabel>
                <Select
                  value={rangeType}
                  onChange={(v) => setRangeType(v as RangeType)}
                  options={[{ label: "全频道", value: "all" }, { label: "指定板块", value: "selectedSections", disabled: sections.length === 0 }]}
                />
                {rangeType === "selectedSections" && (
                  <div className="mt-3 space-y-2 rounded-md bg-bg-page p-3">
                    {sections.map((s) => (
                      <Checkbox key={s.id} checked={sectionIds.includes(s.id)} onChange={(c) => setSectionIds(c ? [...sectionIds, s.id] : sectionIds.filter((x) => x !== s.id))}>
                        {s.name}
                      </Checkbox>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {step === 2 && (
          <Card className="space-y-4">
            <div>
              <FieldLabel>执行方式</FieldLabel>
              <div className="space-y-2">
                <Radio checked={executionMode === "immediate"} onChange={() => setExecutionMode("immediate")}>立即执行</Radio>
                <Radio checked={executionMode === "schedule"} onChange={() => setExecutionMode("schedule")} disabled={!template?.supportSchedule}>定时执行</Radio>
              </div>
            </div>
            {executionMode === "schedule" && (
              <>
                <div>
                  <FieldLabel>定时规则</FieldLabel>
                  <Select value={scheduleType} onChange={(v) => setScheduleType(v as "daily" | "once")} options={[{ label: "每天", value: "daily" }, { label: "单次", value: "once" }]} />
                </div>
                <div>
                  <FieldLabel>{scheduleType === "daily" ? "每日执行时间" : "执行日期和时间"}</FieldLabel>
                  <DatePicker
                    value={scheduleAt}
                    onChange={setScheduleAt}
                    mode={scheduleType === "daily" ? "time" : "datetime"}
                    title={scheduleType === "daily" ? "选择每日执行时间" : "选择执行日期和时间"}
                  />
                </div>
              </>
            )}
            {template?.targetLevel === "channel" && (
              <div>
                <FieldLabel>{template.type === "HOT_SUMMARY" ? "汇总数量" : "扫描上限"}</FieldLabel>
                <Input value={topN} onChange={(e) => setTopN(e.target.value)} type="number" placeholder="10" />
              </div>
            )}
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-2 text-sm text-text-2">
            <h2 className="mb-2 text-lg text-text">请确认任务配置</h2>
            <p>任务类型：{template?.name}</p>
            <p>执行账号：{accounts.find((a) => a.id === accountId)?.nickname || accountId}</p>
            {isChannelTask && <p>执行频道：{channels.find((c) => c.id === channelId)?.name || channelId}</p>}
            <p>执行范围：{isChannelTask ? (rangeType === "all" ? "全频道" : `指定板块:${sectionIds.length} 个`) : "全账号"}</p>
            <p>执行方式：{executionMode === "immediate" ? "立即执行" : scheduleType === "daily" ? `每天 ${formatTime(scheduleAt)}` : formatDateTime(scheduleAt)}</p>
          </Card>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-bg-card p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>返回修改</Button>
            {step < 3 ? (
              <Button disabled={step === 0 && !taskType} onClick={() => setStep((s) => Math.min(3, s + 1))}>下一步</Button>
            ) : (
              <Button loading={busy} disabled={!canSubmit} onClick={submit}>确认提交</Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function nextDefaultTime() {
  const d = new Date();
  d.setHours(23, 30, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}
function formatTime(d: Date) { return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }); }
function formatDateTime(d: Date) { return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }); }
