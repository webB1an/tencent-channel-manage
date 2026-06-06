# 腾讯频道运营助手 · UI 重构设计

**Date:** 2026-06-06
**Status:** Approved (pending implementation plan)
**Scope:** `apps/web` 的全部 5 个页面 + 底部导航
**Out of scope:** 后端 / API / 新功能 / 新依赖

---

## 1. 目标与背景

### 1.1 现状

`apps/web` 是腾讯频道运营助手的手机 H5（Next.js 14 App Router），包含：

- 登录页（`/login`）
- 4 个 tab 页面：首页、任务、结果、我的
- 底部导航 `BottomNav`

视觉现状：

- 单一基础 Tailwind 配置
- 普通 SaaS 蓝色 `#3D7BFF` 作主色
- 白卡片 + 浅灰底、emoji 风图标、无排版层次
- 无动效系统、无主题切换
- 中文走默认 PingFang 渲染，字距未优化

### 1.2 目标

将全部前端页面重构为符合「高级感」标准的视觉系统：

- **品牌记忆点**：通过编辑式排版 + 克制强调色建立差异化
- **可工作的工具感**：不靠装饰性动效堆砌，依赖克制的排版骨架
- **可访问性**：浅深双主题、文字对比度 ≥ 4.5:1、触摸目标 ≥ 44px
- **可维护性**：清晰的 token 系统 + 通用原语 + 业务组件分层

### 1.3 决策摘要

| 维度 | 选择 |
|---|---|
| 调性 | A+B 混合：编辑极简（Linear / Vercel）+ 暗色科技（Anthropic Console） |
| 范围 | 全部 5 个页面 + 底部导航 |
| 配色 | 墨色（ink）+ 酸柠绿（acid lime `#D4F76A`） |
| 深色模式 | 跟随系统 + 手动切换，三态（system / light / dark） |
| 动效 | 克制专业（Linear / Vercel 程度），无 Framer Motion / GSAP |

---

## 2. 视觉系统基础

### 2.1 配色（双主题统一接口）

色板通过 CSS 变量定义，Tailwind 用 `rgb(var(--x) / <alpha-value>)` 引用，保证浅深主题可平滑切换。

**浅色（默认）**

| Token | RGB | 用途 |
|---|---|---|
| `--ink` | `10 10 11` | 主文字 |
| `--ink-2` | `58 58 61` | 次级文字 |
| `--ink-3` | `107 107 112` | 提示文字、icon 未选中 |
| `--ink-4` | `168 168 173` | 弱化文字 |
| `--ink-inverse` | `250 250 247` | 反色文字 |
| `--paper` | `250 250 247` | 主背景（暖白） |
| `--paper-2` | `242 240 234` | sunken 卡片 / 二级背景 |
| `--paper-sunken` | `236 233 224` | 三级背景 / skeleton 底 |
| `--line` | `229 226 218` | 1px hairline 边 |
| `--line-strong` | `213 209 197` | hover 强化边 |
| `--lime` | `212 247 106` | 强调色（唯一） |
| `--lime-ink` | `26 35 5` | lime 背景上的文字 |

**深色（`.dark` 触发）**

| Token | RGB |
|---|---|
| `--ink` | `242 242 238` |
| `--ink-2` | `181 181 176` |
| `--ink-3` | `110 110 104` |
| `--ink-4` | `58 58 54` |
| `--ink-inverse` | `10 10 11` |
| `--paper` | `10 10 11` |
| `--paper-2` | `20 20 19` |
| `--paper-sunken` | `5 5 5` |
| `--line` | `31 31 29` |
| `--line-strong` | `48 48 45` |
| `--lime` | `212 247 106` |
| `--lime-ink` | `26 35 5` |

**状态色**（保留 3 色，scale 不展开）

- `--risk-high`: `#E5484D`
- `--risk-mid`: `#F5A524`
- `--risk-low`: `#30A46C`

### 2.2 字体

通过 `next/font` 自托管（避免 CDN 抖动、零隐私问题）。

```ts
fontFamily: {
  sans: [
    "InterVariable",
    "ui-sans-serif",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    "system-ui",
  ],
  mono: [
    "JetBrainsMonoVariable",
    "ui-monospace",
    "SFMono-Regular",
    "monospace",
  ],
  display: [
    "InterVariable",
    "ui-sans-serif",
    "PingFang SC",
  ],
}
```

中文走 `font-feature-settings: "palt"`，让 PingFang 接近西文的专业字距。

### 2.3 字号刻度（编辑式）

```ts
fontSize: {
  "d1":   ["44px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "500" }],
  "d2":   ["32px", { lineHeight: "1.1",  letterSpacing: "-0.03em", fontWeight: "500" }],
  "d3":   ["24px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "500" }],
  "h1":   ["20px", { lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "600" }],
  "h2":   ["17px", { lineHeight: "1.35", fontWeight: "600" }],
  "h3":   ["15px", { lineHeight: "1.4",  fontWeight: "600" }],
  "body": ["14px", { lineHeight: "1.55" }],
  "small":["13px", { lineHeight: "1.5" }],
  "mini": ["12px", { lineHeight: "1.45" }],
  "micro":["11px", { lineHeight: "1.4",  letterSpacing: "0.02em" }],
}
```

### 2.4 圆角、阴影、间距

```ts
borderRadius: {
  "sm": "6px",
  "md": "10px",
  "lg": "16px",
  "xl": "24px",
},
boxShadow: {
  "sheet": "0 -8px 32px -8px rgba(0,0,0,0.18), 0 -1px 0 var(--line) inset",
  "pop":   "0 8px 24px -8px rgba(0,0,0,0.16), 0 0 0 1px var(--line)",
},
```

默认无阴影，靠 1px hairline 描边建立层级。仅 Sheet / Popover / Dropdown 浮层用阴影。

### 2.5 动效曲线

```ts
transitionTimingFunction: {
  "out-expo":     "cubic-bezier(0.16, 1, 0.3, 1)",     // 入场
  "out-quint":    "cubic-bezier(0.22, 1, 0.36, 1)",     // 默认
  "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",     // 主题切换
}
```

全部动效 ≤ 300ms。`prefers-reduced-motion: reduce` 全部降级为 0.01ms。

### 2.6 主题切换

`tailwind.config.ts` 设 `darkMode: ["class", ".dark"]`。

```tsx
// app/layout.tsx <head> 内 inline script 防 FOUC
(function() {
  try {
    var t = localStorage.getItem('tcm_theme') || 'system';
    var d = t === 'dark' ||
            (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
```

`lib/theme.ts` 暴露 `getTheme` / `setTheme` / `applyTheme`，并全局监听 `matchMedia('(prefers-color-scheme: dark)')` 变化以实时响应系统切换。

---

## 3. 文件结构

```
apps/web/
  app/
    globals.css                # 字体导入、CSS 变量、@layer、动画
    layout.tsx                 # 注入主题 class、字体变量、FOUC 防御
    (tabs)/...                 # 4 个 tab 页（结构不变）
    login/...                  # 登录页
  components/
    ui/                        # 通用原语
      Button.tsx
      Input.tsx
      Textarea.tsx
      Select.tsx
      Card.tsx
      Badge.tsx
      Segmented.tsx
      Sheet.tsx
      ThemeToggle.tsx
      Skeleton.tsx
    layout/
      Shell.tsx                # 全局壳（max-w、安全区）
      BottomNav.tsx            # 重做
    patterns/                  # 业务组件
      NumberTicker.tsx
      StatCard.tsx
      RiskCard.tsx
      RiskCardCompact.tsx
      HotTopicItem.tsx
      TaskCard.tsx
      TokenRow.tsx
      ModelRow.tsx
      EmptyState.tsx
  lib/
    theme.ts                   # 主题切换逻辑
  tailwind.config.ts           # 重写 token
```

---

## 4. 核心 UI 组件库

### 4.1 Button

**变体**：`primary` / `secondary` / `ghost` / `danger` / `dangerGhost` / `amberGhost`
**尺寸**：`sm` (32px) / `md` (40px) / `lg` (48px)
**状态**：default / hover / active / disabled / loading

- `primary`：lime 底 + lime-ink 文字
- `secondary`：paper 底 + 1px line 边 + ink 文字
- `ghost`：透明底 + ink 文字，hover 时 paper-2 底
- `danger`：risk-high 底 + 白字
- `dangerGhost`：透明底 + risk-high 文字，hover 时 `risk-high/10` 底
- `amberGhost`：透明底 + risk-mid 文字，hover 时 `risk-mid/10` 底（用于"禁言"等中风险操作，区别于删除）
- loading：保留原宽，文字换 mono `···` 三点循环
- 圆角 `md` (10px)，字重 500
- 按压 `scale(0.98)` + 80ms

### 4.2 Input / Textarea / Select

- 默认 1px `line` 边，bg `paper`，圆角 `md`
- 文字 `text-body` ink，placeholder `ink-3`
- 聚焦：边色变 `ink`（0.18s），同时内层出现 1px lime 下边线（box-shadow inset）
- 错误：边色 `risk-high`，下方 `micro` 红色提示
- 行高：40px（与 Button.md 对齐）

### 4.3 Card

**变体**：`default` / `sunken` / `outline`
- `default`：bg `paper`，1px `line` 边，rounded `lg`，无阴影
- `sunken`：bg `paper-2`，无边（用于"被嵌入"的子区块）
- `outline`：透明底 + 1px `line` 边
- 内边距：`p-3` / `p-4` / `p-5`
- 可选 `header` slot：上下分块用 1px `line` 分割

### 4.4 Badge

**变体**：`neutral` / `riskHigh` / `riskMid` / `riskLow` / `lime` / `outline`
- 圆角 `sm` (6px)，文字 `micro` (11px) + tracking 0.02em
- 高度 20px，padding x-1.5
- 风险色用 10% alpha 底 + 纯色字
- 中文 label 显式 enum 处理（避免 `.toUpperCase()` 无意义问题）

### 4.5 Segmented

- 容器：1px `line` 边 + `paper` 底，圆角 `md`
- 内部 grid 平分
- active 段：bg `ink`，text `ink-inverse`（克制，不抢 lime）
- inactive 段：text `ink-2`
- 切换 180ms 颜色 cross-fade
- 选项支持 `{ value, label, count? }`，count 显示在 label 后

### 4.6 Sheet（底部抽屉）

- 遮罩：bg `ink/40` + 0.2s 淡入
- 抽屉：从底部上滑，320ms `out-expo`，顶部圆角 `xl` (24px)
- 顶部 36×4px 灰条拖动指示
- 内容 paper 底，padding 20px，安全区 16px
- 关闭：点击遮罩 / ESC / 按钮（基础版不做滑动下拖）
- 操作区两列：secondary 取消 + danger 确认

### 4.7 ThemeToggle

- 位置：BottomNav 右侧第 5 格
- 24×24px 圆形按钮，bg 透明，hover 时 paper-2
- 图标：日 / 月，1.6 stroke，ink-2 色
- 点击循环：`system` → `light` → `dark` → `system`
- 当前有效主题为 dark 时显示太阳图标，否则显示月亮
- 切换瞬间 `<html>` 加 `.theme-switching` class，触发 240ms 全站颜色 cross-fade

### 4.8 Skeleton

- 圆角 `sm`，bg `paper-2`
- 1.4s 横向渐变扫光关键帧
- 替代现有"loading..."文字

---

## 5. 业务组件

### 5.1 NumberTicker

`IntersectionObserver` 触发，进入视口时用 `requestAnimationFrame` + easeOutExpo 从 0 滚到目标值。Prop：`value`、`duration` (900ms)、`format`。

### 5.2 StatCard

- 容器：1px `line` 边、bg `paper`、圆角 `lg`、padding 16px
- 顶部 micro 标签（`TASKS` / `RUNNING` / `PENDING`），ink-3 色 + tracking 0.04em
- 主体 d2 字号 (32px)、ink 色、`tabular-nums`
- 底部 micro 描述（`全部` / `进行中` / `待处理`）
- `accent` 变体：背景翻 `ink` + 文字 `ink-inverse` + 右上角 lime 圆点

### 5.3 RiskCard

- 容器：Card default + 左侧 3px 竖条（颜色按 `riskLevel` 映射）
- 顶部：左侧 Badge + 右侧 `createdAt` 相对时间（如 `2h ago` / `昨天`，由 `Intl.RelativeTimeFormat('zh-CN')` 渲染）
- 标题：h3 字号，1 行 truncate
- 内容：small 字号 ink-2，2 行 line-clamp
- 元信息：micro 字号 ink-3
- AI 原因块：sunken 卡片，前缀 lime 小圆点
- 底部 4 列等宽 Button sm：忽略（ghost）/ 已处理（secondary）/ 删除（dangerGhost）/ 禁言（amber dangerGhost）
- HIGH/CRITICAL 时整卡 1.8s 呼吸描边（lime/risk-high inset 0 0 0 1px 透明度 0→0.4→0）

### 5.4 RiskCardCompact

首页用的紧凑版，单行布局：徽章 + 标题 + 1 行 line-clamp + 元信息行。

### 5.5 HotTopicItem

- 行布局：`[rank 徽章] [标题块]`
- Top 3 rank 徽章：bg `lime`，text `lime-ink`，h3 字号，圆角 `sm`
- 4+ rank 徽章：bg `paper-2`，text `ink-3`
- 标题：h3 字号，单行 truncate
- 元信息：micro ink-3，作者 · 赞 · 评论
- 整行可点击（铺 a 标签），hover 时 bg `paper-2`

### 5.6 TaskCard

- 容器：Card default
- 顶部：左侧 2 行（h2 类型 + micro 调度），右侧 Button secondary sm "运行一次"
- 状态行：Badge 显示 ACTIVE/PAUSED，micro 文字 `最近：SUCCESS · 18:30`
- 进度条：仅运行中显示（1px line + lime 填充）

### 5.7 TokenRow / ModelRow

- 顶行：左侧 label（h3）/ 右侧 Badge
- 底行：micro 字号 ink-3（token 尾号 / model URL）
- 操作按钮：右下角 Button ghost sm
- 整行 hover 时边色变 `line-strong`

### 5.8 EmptyState

- 居中：32×32 line-art SVG（1.5px stroke）+ 标题 + hint
- 间距 24px，文字 small ink-2
- 三套 SVG：folder / inbox / pulse

---

## 6. 页面设计

### 6.1 登录页（`/login`）

```
TENCENT                         ← d1 wordmark
CHANNELS · OPS                  ← micro 标签

───────                         ← 1px × 32px 装饰线

频道运营工作台                   ← h1
用 AI 守好你的频道。              ← body ink-2

用户名
[_____________________]
密码
[_____________________]

[    登录    ]                   ← Button primary lg fullWidth

v0.1 · 2026                     ← 底部 micro
```

- 整页 bg `paper`，无渐变
- wordmark：纯文字 `TENCENT`，Inter `d1` + tracking 0.06em
- 装饰线 32px × 1px `ink`，作为品牌签名
- 中文标题走 `font-feature-settings: "palt"`
- 错误态：`text-risk-high small`，不破坏版式
- 深色模式：wordmark 与装饰线保留 lime 突出"AI 高级感"

### 6.2 首页（`/home`）

```
FRIDAY · 2026-06-06             ← mono micro

今日运营台                       ← d2
早上好，{username}。              ← body ink-2（username 来自 `api.login` 返回的 user 对象，未登录态显示"频道主"）

───────

[ TASKS ]  [ ● RUN. ]  [ PEND. ]
   12          3            5
  全部        进行中       待处理

待处理风险 · 2
┌─────────────────────────┐
│ ● HIGH  重复广告内容      │
│   短时间大量重复内容       │
│   示例用户 · 3赞 · 1评    │
└─────────────────────────┘

今日热门 · 3 个话题
┌─────────────────────────┐
│ [1] 新版本发布  142 提及   │
│ [2] 活动福利     98 提及   │
│ [3] 经验分享     64 提及   │
└─────────────────────────┘

[管理任务 →]  [查看结果 →]
```

- `px-5 pt-8 pb-12`，section 间 `mt-8` / `mt-6`
- 日期 mono 字体 + tracking 0.08em
- StatCard 三联"运行中"用 accent 变体
- section 标题 `h2` 字号 + 右侧 micro 计数
- RiskCardCompact 用于待处理风险
- 底部"管理任务 / 查看结果"用 secondary 风格 + → 字符

### 6.3 任务页（`/tasks`）

```
任务                             ← d2
配置你的自动化运营                ← body ink-2
───────

① 选择任务类型
[ 频道巡检 | 每日热门 ]           ← Segmented

② 关联频道
┌─────────────────────────┐
│ Token    [选择 ▼]         │    ← Card sunken
│ 频道     [选择 ▼]         │
│ 板块     [选择 ▼] [同步]  │
└─────────────────────────┘

③ 模型（仅巡检）
当前：deepseek-chat              ← micro
在"我的"配置更多 →

④ 执行计划
[ 立即执行 | 每日 23:30 ]

巡检扫描当天帖子...               ← 说明

[    保存并执行    ]

我的任务 · 2
┌─────────────────────────┐
│ 频道巡检       [运行一次] │
│ 每日 · 23:30 · ACTIVE     │
│ 最近：SUCCESS · 18:30     │
└─────────────────────────┘
```

- ①②③④ mono 数字 + ink-2 色，让表单变"决策漏斗"
- 切换任务类型时，模型 section 0.2s 淡入淡出
- 消息提示内联到对应 section 顶部（不再用顶部全局条）

### 6.4 结果页（`/results`）

```
结果                  📅 06-06    ← d2 + mono micro
───────

[ 巡检 · 5 | 热门 · 3 ]          ← Segmented with count

巡检 tab:
┌─────────────────────────┐
│▎ HIGH · 处理            │    ← 左侧 3px 颜色竖条
│  重复广告内容            │
│  短时间内大量重复内容...  │
│  示例用户 · 3赞 · 1评    │
│  ● AI 短时大量重复内容   │
│  [忽略][已处理][删除][禁言]│
└─────────────────────────┘

热门 tab:
┌─────────────────────────┐
│ DATE · 2026-06-06       │
│ ① 新版本发布  142 提及   │    ← lime rank
│ ② 活动福利     98 提及   │
│ ③ 经验分享     64 提及   │
└─────────────────────────┘
```

- Segmented 内置计数
- RiskCard 完整版（区别于首页紧凑版）
- 操作按钮 sm 尺寸、宽度等分；颜色按操作风险等级
- Sheet 二次确认：标题 `h1`，描述 `body` ink-2

### 6.5 我的页（`/profile`）

```
我的                             ← d2
admin                           ← body ink-2
───────

账户
┌─────────────────────────┐
│ 退出登录              → │    ← 整行点击，文字 risk-high
└─────────────────────────┘

频道 Token · 1
┌─────────────────────────┐
│ [输入备注]              │
│ [粘贴 token 文本框]     │
│ [    保存并校验    ]     │
│ ───────────────────    │
│ 主号    ● 有效    [同步] │    ← TokenRow
│ 尾号 ···3a7f            │
└─────────────────────────┘

模型配置 · 1
┌─────────────────────────┐
│ [Base URL]              │
│ [Model]                 │
│ [API Key]               │
│ [    保存并测试    ]     │
│ ───────────────────    │
│ deepseek-chat           │
│ api.openai.com          │
└─────────────────────────┘
```

- 顶部副标显示用户名
- 三个 section：`账户` / `频道 Token` / `模型配置`
- section 标题 `h2` + 右侧 micro 计数
- "退出登录"独立卡片，文字 `risk-high`
- 输入框之间 8px 间距
- 顶部 message 改成 section 内 inline micro（成功 lime-ink on lime）

### 6.6 底部导航

- 容器：1px `line` 顶边 + bg `paper` + safe-bottom
- 5 格顺序：首页 / 任务 / 结果 / 我的 / 主题
- **未选中**：icon ink-3，文字 micro ink-3
- **选中**：icon + 文字在 `ink` 圆角药丸内，文字 `ink-inverse`
- 主题格：始终显示 `ThemeToggle`，无 active 态
- 整格高度 56px，icon 1.6px stroke
- 选中态用"反色药丸"（黑底白字），保持克制

---

## 7. 动效系统

| 动效 | 实现 | 时长 / 曲线 |
|---|---|---|
| 列表 stagger 入场 | CSS 关键帧 + nth-child delay | 320ms out-expo，30ms 步进 |
| 数字滚动 | IntersectionObserver + rAF | 900ms easeOutExpo |
| 页面切换 | CSS 淡入 | 280ms out-quint |
| Sheet 抽屉 | CSS keyframe translateY | 320ms out-expo |
| 主题切换 | `<html>.theme-switching` class 触发 transition | 240ms in-out-cubic |
| RiskCard HIGH 呼吸 | CSS 关键帧 box-shadow | 1.8s ease-in-out infinite |

全部受 `@media (prefers-reduced-motion: reduce)` 降级。

---

## 8. 验证策略

### 8.1 自动化

| 检查 | 命令 | 通过标准 |
|---|---|---|
| TypeScript | `npm -w apps/web run typecheck` | 0 error |
| ESLint | `npm -w apps/web run lint` | 0 error |
| Next build | `npm -w apps/web run build` | 编译通过，无 hydration warning |
| Mock 启动 | `NEXT_PUBLIC_USE_MOCK=1 npm -w apps/web run dev` | 启动 < 5s |

### 8.2 视觉验证清单

启动后用手机或 Chrome DevTools iPhone 14 Pro 模拟逐项检查。

**视觉系统**
- [ ] 浅色 / 深色两套都看，不串色
- [ ] 所有卡片有 1px hairline，无阴影（除 sheet）
- [ ] 装饰线（登录页 + 4 tab 标题下）位置正确
- [ ] Inter / JetBrains Mono 加载正常，无字体回退

**登录页**
- [ ] wordmark "TENCENT" 字号 44px
- [ ] 副标 "CHANNELS · OPS" 间距正确
- [ ] 输入框聚焦时底边变 lime
- [ ] 错误信息显示在按钮上方、不破坏版式

**首页**
- [ ] 三个 StatCard 数字 0 → 目标值滚动
- [ ] "运行中"卡是黑底白字 + lime 圆点
- [ ] 列表项 stagger 入场
- [ ] 空状态用 line-art SVG

**任务页**
- [ ] ①②③④ 数字 section 标题显示
- [ ] 切换任务类型时，模型 section 显隐平滑
- [ ] Token / 频道 / 板块 select 正常工作

**结果页**
- [ ] Segmented 显示计数
- [ ] RiskCard 左侧 3px 竖条颜色正确
- [ ] HIGH 风险有呼吸描边
- [ ] Sheet 上滑 + 二次确认流程通畅

**我的页**
- [ ] 三个 section 分区清晰
- [ ] 退出登录单独成行
- [ ] TokenRow / ModelRow 状态徽章正确

**底部导航**
- [ ] 5 格：首页 / 任务 / 结果 / 我的 / 主题
- [ ] 选中态是黑底白字药丸
- [ ] 主题切换图标 + 全站颜色 cross-fade

**主题切换**
- [ ] 首次访问跟随系统
- [ ] 切换无 FOUC
- [ ] localStorage 持久化
- [ ] 系统切换时实时响应

**响应式**
- [ ] 320px 宽不溢出
- [ ] 480px 上限生效
- [ ] 触摸目标 ≥ 44px
- [ ] safe-bottom 生效

### 8.3 浏览器兼容

- iOS Safari 16+（主战场）
- Android Chrome 最新
- 桌面 Chrome / Safari / Firefox 验证布局

---

## 9. 实施顺序

1. **基础设施**：`tailwind.config.ts` 重写、`globals.css` token、`layout.tsx` 字体 + theme script、`lib/theme.ts`
2. **UI 原语**：`Button` / `Input` / `Card` / `Badge` / `Segmented` / `Sheet` / `ThemeToggle` / `Skeleton`
3. **业务组件**：`NumberTicker` / `StatCard` / `RiskCard(Compact)` / `HotTopicItem` / `TaskCard` / `TokenRow` / `ModelRow` / `EmptyState`
4. **页面改造**（按访问频次）：Home → Tasks → Results → Profile → Login
5. **底部导航**：`BottomNav` 重做 + 集成 `ThemeToggle`
6. **验证**：自动化 → 视觉清单 → 主题切换 → 响应式

---

## 10. 范围外（明确不做）

- 新功能（保持现有 5 个页面 + 底部导航的范围）
- 后端 / API 改动
- 滚动驱动 / pin / scrub / morph 等复杂动效
- i18n 框架
- 引入 Framer Motion / GSAP 等动画库
- 新增 npm 依赖（除 `next/font` 自带字体外）
- 引入 lucide / heroicons 等图标库
- 新建除现有 5 个页面 + 底部导航外的任何新页面
- 改动 `lib/api.ts` 的 mock 数据

---

## 11. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 字体加载慢 | `next/font` 自托管 + 字体子集 + `font-display: swap` |
| Tailwind 升级到 4 需重写 config | 当前 3.4，保持 3.x 风格；不主动升级 |
| 暗色模式色对比度 | 已在 token 数值验证 ≥ 4.5:1 |
| 触摸目标 < 44px | Button sm=32px 仅卡片内操作；顶部 CTA 一律 md/lg |
| 列表 stagger 在低性能设备卡顿 | 30ms 步进已保守；`prefers-reduced-motion` 降级 |
| FOUC | inline script 在水合前同步执行主题 class |
| App Router 与 `useEffect` 时序 | 主题切换与 mock 数据都用 `useEffect`；FOUC 防御 script 解决 |

---

## 12. 决策日志

| 决策 | 选项 | 选择 | 理由 |
|---|---|---|---|
| 调性 | 编辑极简 / 暗色科技 / 软质高级 | A+B 混合 | 工具产品 + AI 调性 + 高端感 |
| 范围 | 全部 / 3 页 / 先样板 | 全部 | 视觉系统需一致 |
| 主色 | 墨+酸柠 / 朱墨+朱红 / 蓝灰+电光青 | 墨+酸柠 | AI / dev tool 调性，与原蓝色差异明显 |
| 暗色 | 跟随系统+切换 / 永浅 / 永深 | 跟随+切换 | 户外可用 + 高级感展示 |
| 动效 | 克制 / 克制+hero / 全面表达 | 克制 | 工具类避免动效噪音 |
