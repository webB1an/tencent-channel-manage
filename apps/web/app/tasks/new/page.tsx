"use client";

import { Suspense, useEffect, useId, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio } from "@/components/ui/radio";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";
import { Card } from "@/components/ui/card";
import { StepIndicator, IconBadge, ReviewSummary, EmptyState } from "@/components/patterns";
import {
  accountService,
  channelService,
  executionService,
  taskService,
  type Account,
  type Channel,
  type RangeType,
  type Section,
  type TaskTemplate,
} from "@/lib/domain";
import { formatShortDate, formatTime } from "@/lib/utils";

const TASK_ICONS: Record<string, IconName> = {
  INSPECTION: "shield",
  HOT_SUMMARY: "trending-up",
  SYNC_CHANNELS: "refresh-cw",
};

export default function NewTaskPage() {
  return (
    <Suspense fallback={null}>
      <NewTaskPageInner />
    </Suspense>
  );
}

function NewTaskPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [taskType, setTaskType] = useState<string>(() => search?.get("type") ?? "");
  const [accountId, setAccountId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [rangeType, setRangeType] = useState<RangeType>("all");
  const [sectionIds, setSectionIds] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<"immediate" | "schedule">("immediate");
  const [scheduleType, setScheduleType] = useState<"daily" | "once">("daily");
  const [scheduleAt, setScheduleAt] = useState<Date>(() => nextDefaultTime());
  const [topN, setTopN] = useState("10");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [busy, setBusy] = useState(false);

  const accountIdFieldId = useId();
  const channelIdFieldId = useId();
  const rangeTypeFieldId = useId();
  const scheduleTypeFieldId = useId();
  const scheduleAtFieldId = useId();
  const topNFieldId = useId();
  const postTitleFieldId = useId();
  const postContentFieldId = useId();

  const template = useMemo(() => templates.find((t) => t.type === taskType), [templates, taskType]);
  const isChannelTask = template?.targetLevel === "channel";
  const canSubmit = Boolean(
    template && accountId && (!isChannelTask || channelId) && (rangeType !== "selectedSections" || sectionIds.length > 0)
  );

  useEffect(() => {
    Promise.all([taskService.getTaskTemplates(), accountService.getAccountList()])
      .then(([tpl, acc]) => {
        setTemplates(tpl);
        setAccounts(acc);
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, []);

  useEffect(() => {
    if (!accountId) return;
    channelService
      .getChannelsByAccount(accountId)
      .then((rows) => {
        setChannels(rows);
        setChannelId("");
        setSections([]);
        setSectionIds([]);
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, [accountId]);

  useEffect(() => {
    if (!accountId || !channelId) return;
    channelService
      .getSectionsByChannel(accountId, channelId)
      .then((rows) => {
        setSections(rows);
        setSectionIds([]);
        if (rows.length === 0) setRangeType("all");
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }));
  }, [accountId, channelId]);

  async function submit() {
    if (!template) return;
    if (!canSubmit) {
      Toast.show({ content: isChannelTask ? "请选择账号和频道" : "请选择账号", type: "error" });
      return;
    }
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
        taskConfig: { topN: Number(topN) || 10, rangeType, sectionIds, postTitle, postContent, allowDuplicates },
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

  // Map stage 0..3 to step 1..7 for the indicator
  const stepNumber = step + 1;
  const totalSteps = 7;
  const ranges: Array<{ from: number; to: number; label: string }> = [
    { from: 1, to: 1, label: "任务类型与账户选择" },
    { from: 2, to: 3, label: "频道与发布范围" },
    { from: 4, to: 4, label: "任务参数" },
    { from: 5, to: 6, label: "执行与调度" },
    { from: 7, to: 7, label: "确认提交" },
  ];
  const currentRange = ranges[step];

  const next = () => setStep((s) => Math.min(ranges.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const canProceed = () => {
    if (step === 0) return Boolean(taskType && accountId && (!isChannelTask || channelId));
    if (step === 1) return rangeType !== "selectedSections" || sectionIds.length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return canSubmit;
  };

  return (
    <>
      <TopBar
        title="新建任务"
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多" }), label: "更多" }]}
      />

      <main className="page-shell space-y-5 pb-32">
        {/* Step header */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-primary">
              {step === 0 ? `第 ${stepNumber}/7 步` : `Step ${currentRange.from}-${currentRange.to}: ${currentRange.label}`}
            </span>
            <span className="text-ink-muted">{currentRange.label}</span>
          </div>
          <StepIndicator current={currentRange.from} total={totalSteps} variant="bar" />
        </section>

        {/* Stage 0: type + account */}
        {step === 0 && (
          <div className="space-y-5">
            <section className="space-y-3">
              <h2 className="font-display text-[16px] font-semibold text-ink">选择任务类型</h2>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((tpl) => {
                  const selected = taskType === tpl.type;
                  return (
                    <button
                      key={tpl.type}
                      onClick={() => setTaskType(tpl.type)}
                      className={
                        "rounded-lg border bg-bg-card p-4 text-center transition-all u-press " +
                        (selected
                          ? "border-primary bg-primary-soft/50 ring-2 ring-primary"
                          : "border-border hover:border-primary")
                      }
                    >
                      <span
                        className={
                          "mx-auto flex h-12 w-12 items-center justify-center rounded-lg transition-colors " +
                          (selected ? "bg-primary text-white" : "bg-info-soft text-info")
                        }
                      >
                        <Icon name={TASK_ICONS[tpl.type] ?? "zap"} size={22} />
                      </span>
                      <p className="mt-2.5 font-display text-[14px] font-semibold text-ink">{tpl.name}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <Card padding="md" className="space-y-4">
              <h3 className="font-display text-[14px] font-semibold text-ink">选择执行账号</h3>
              <Select
                id={accountIdFieldId}
                value={accountId}
                onChange={setAccountId}
                options={accounts.map((a) => ({
                  label: `${a.nickname || a.qq} · ${a.status === "normal" ? "正常" : "异常"}`,
                  value: a.id,
                }))}
                title="选择执行账号"
                placeholder="请选择执行账号"
              />
            </Card>
          </div>
        )}

        {/* Stage 1: channel + range (steps 2-3) */}
        {step === 1 && (
          <div className="space-y-5">
            {isChannelTask && (
              <Card padding="md" className="space-y-3">
                <h3 className="font-display text-[14px] font-semibold text-ink">选择发布频道</h3>
                {channels.length === 0 ? (
                  <EmptyState title="暂无频道" hint="请先在账号详情刷新频道" icon="megaphone" />
                ) : (
                  <ul className="space-y-2">
                    {channels.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => setChannelId(c.id)}
                          className={
                            "flex w-full items-center gap-3 rounded-lg border bg-bg-card p-3 text-left u-press transition-colors " +
                            (channelId === c.id ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary")
                          }
                        >
                          <IconBadge icon="hash" tone={channelId === c.id ? "primary" : "info"} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-ink">{c.name}</p>
                            <p className="font-mono text-[11px] text-ink-muted">ID: CH_{c.channelId}</p>
                          </div>
                          {channelId === c.id && <Icon name="check-circle" size={20} className="text-primary" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {isChannelTask && (
              <Card padding="md" className="space-y-3">
                <h3 className="font-display text-[14px] font-semibold text-ink">设置发布范围</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all" as const, label: "全部发布", desc: "覆盖全频道" },
                    { value: "selectedSections" as const, label: "指定分区", desc: "仅指定板块" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRangeType(opt.value)}
                      className={
                        "rounded-lg border p-3 text-left u-press transition-colors " +
                        (rangeType === opt.value ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary")
                      }
                    >
                      <p className="font-medium text-ink">{opt.label}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {rangeType === "selectedSections" && (
                  <div className="space-y-2 rounded border border-border bg-surface-container-low p-3">
                    {sections.length === 0 ? (
                      <p className="text-center text-[12px] text-ink-muted">该频道没有可用板块</p>
                    ) : (
                      sections.map((s) => (
                        <Checkbox
                          key={s.id}
                          checked={sectionIds.includes(s.id)}
                          onChange={(c) =>
                            setSectionIds(c ? [...sectionIds, s.id] : sectionIds.filter((x) => x !== s.id))
                          }
                        >
                          {s.name}
                        </Checkbox>
                      ))
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Stage 2: Task parameters (step 4) */}
        {step === 2 && (
          <Card padding="md" className="space-y-4">
            <h3 className="font-display text-[14px] font-semibold text-ink">任务参数</h3>
            <Input
              id={postTitleFieldId}
              label="Post Title"
              optional
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="e.g. Weekly Community Update"
            />
            <div>
              <label htmlFor={postContentFieldId} className="mb-1.5 block text-[13px] font-medium text-ink">
                Post Content
              </label>
              <textarea
                id={postContentFieldId}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Enter your task details or content here..."
                rows={4}
                className="block w-full rounded border border-border bg-bg-card p-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
              />
            </div>
            {isChannelTask && (
              <Input
                id={topNFieldId}
                label={template?.type === "HOT_SUMMARY" ? "汇总数量" : "扫描上限"}
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                type="number"
                placeholder="10"
              />
            )}
            <div className="flex items-center justify-between rounded border border-border bg-surface-container-low p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Allow Duplicates</p>
                <p className="text-[11px] text-ink-muted">Enable to permit multiple identical tasks</p>
              </div>
              <Switch checked={allowDuplicates} onChange={setAllowDuplicates} ariaLabel="允许重复" />
            </div>
          </Card>
        )}

        {/* Stage 3: execution mode (steps 5-6) */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-display text-[16px] font-semibold text-ink">选择执行模式</h3>
            <button
              onClick={() => setExecutionMode("immediate")}
              className={
                "flex w-full items-center gap-4 rounded-lg border bg-bg-card p-4 text-left u-press transition-colors " +
                (executionMode === "immediate" ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary")
              }
            >
              <span
                className={
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg " +
                  (executionMode === "immediate" ? "bg-primary text-white" : "bg-info-soft text-info")
                }
              >
                <Icon name="zap" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold text-ink">立即执行</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">配置完成后,系统将排队进入工作流</p>
              </div>
              {executionMode === "immediate" && <Icon name="check-circle" size={20} className="text-primary" />}
            </button>
            <button
              onClick={() => setExecutionMode("schedule")}
              className={
                "flex w-full items-center gap-4 rounded-lg border bg-bg-card p-4 text-left u-press transition-colors " +
                (executionMode === "schedule" ? "border-primary bg-primary-soft/50" : "border-border hover:border-primary")
              }
            >
              <span
                className={
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg " +
                  (executionMode === "schedule" ? "bg-warning text-white" : "bg-warning-soft text-warning")
                }
              >
                <Icon name="clock" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-semibold text-ink">计划执行</p>
                <p className="mt-0.5 text-[12px] text-ink-muted">自定义时间周期与触发时机</p>
              </div>
              {executionMode === "schedule" && <Icon name="check-circle" size={20} className="text-primary" />}
            </button>

            {executionMode === "schedule" && (
              <Card padding="md" className="space-y-3">
                <Select
                  id={scheduleTypeFieldId}
                  value={scheduleType}
                  onChange={(v) => setScheduleType(v as "daily" | "once")}
                  options={[
                    { label: "每天", value: "daily" },
                    { label: "单次", value: "once" },
                  ]}
                  title="定时规则"
                />
                <DatePicker
                  id={scheduleAtFieldId}
                  value={scheduleAt}
                  onChange={setScheduleAt}
                  mode={scheduleType === "daily" ? "time" : "datetime"}
                  title={scheduleType === "daily" ? "选择每日执行时间" : "选择执行日期和时间"}
                />
              </Card>
            )}
          </div>
        )}

        {/* Stage 4: Review (step 7) */}
        {step === 4 && (
          <div className="space-y-4">
            <header>
              <h2 className="font-display text-[18px] font-semibold text-ink">Task Parameters</h2>
              <p className="mt-1 text-[13px] text-ink-muted">Configure the final details and review your task.</p>
            </header>
            <ReviewSummary
              serverNode="SG-01"
              groups={[
                {
                  title: "Review Confirmation",
                  items: [
                    { label: "Account", value: accounts.find((a) => a.id === accountId)?.nickname || accountId || "—" },
                    { label: "Channel", value: channels.find((c) => c.id === channelId)?.name || "—" },
                    { label: "Scope", value: rangeType === "all" ? "Full Channel" : `${sectionIds.length} sections` },
                    { label: "Schedule", value: executionMode === "immediate" ? "Immediate" : scheduleType === "daily" ? `Daily @ ${formatTime(scheduleAt)}` : formatShortDate(scheduleAt) },
                  ],
                },
                {
                  title: "Post Configuration",
                  items: [
                    { label: "Post Title", value: postTitle || "—" },
                    { label: "Top N", value: topN },
                    { label: "Duplicates", value: allowDuplicates ? "Allowed" : "Not allowed" },
                    { label: "Task Type", value: template?.name ?? "—" },
                  ],
                },
              ]}
            />
          </div>
        )}
      </main>

      {/* Fixed bottom nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-phone border-t border-border bg-bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" disabled={step === 0} onClick={prev}>
            <Icon name="arrow-left" size={16} />
            上一步
          </Button>
          {step < 4 ? (
            <Button size="lg" disabled={!canProceed()} onClick={next}>
              下一步
              <Icon name="arrow-right" size={16} />
            </Button>
          ) : (
            <Button size="lg" loading={busy} disabled={!canSubmit} onClick={submit} className="shadow-primary">
              确认提交
              <Icon name="check" size={16} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function nextDefaultTime() {
  const d = new Date();
  d.setHours(23, 30, 0, 0);
  if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
  return d;
}
