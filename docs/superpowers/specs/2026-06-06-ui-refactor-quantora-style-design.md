# 腾讯频道运营助手 · UI 重构设计（quantora 调性）

**Date:** 2026-06-06
**Status:** Draft — awaiting user review
**Scope:** `apps/web` 的全部页面、底部导航、TopBar、表单、卡片、token 系统、组件基础层
**Reference:** `D:\Work\web\quantora-ai-h5`（Vue 3 + Vant 4 H5 移动端项目）
**Out of scope:** 后端 / API / 新功能 / 新增 npm 依赖（除 `clsx` / `tailwind-merge` 之类工具外）/ Prisma schema / 数据模型

---

## 0. 上下文与动机

`tcm/apps/web` 上一轮已做了一次 ink+lime 编辑式重构（见 `2026-06-06-tencent-channel-ui-redesign-design.md`）。这一轮用户决定视觉方向**整体切换**到 `D:\Work\web\quantora-ai-h5` 的风格基因：

- 主色从 **酸柠绿** 改为 **青蓝 #2cb0a7**
- 背景从 paper-white 改为 **淡薰衣草蓝 #f2f4fb** + 顶部 radial 绿光晕
- 表面统一为 **白底 + 1px 浅灰边**，移除 paper-ink / sunken / 多层 surface
- 字体栈收敛到 **PingFang SC 单栈**（移除 Inter / JetBrains Mono）
- **完全移除暗色模式**
- 组件层从 **antd-mobile** 替换为 **shadcn 风格 copy-paste 原语**（Tailwind + 极少 a11y hook）
- 动画收敛到 4 段内置过渡（Sheet up / fade in / pop in / slide down）

落地节奏：**一轮提交**，所有页面一次性迁移。

---

## 1. 设计 Token

### 1.1 颜色

| Token | 值 | 用途 |
|---|---|---|
| `--primary-color` | `#2cb0a7` | 主色（按钮、激活态、链接、Tab 下划线） |
| `--primary-soft` | `#d3f1ee` | 主色淡背景（卡片选中 / 高亮底） |
| `--text-color` | `#1d2132` | 主文字 |
| `--text-color-2` | `#5b6478` | 次级文字 / 描述 |
| `--text-color-3` | `#9097a8` | 三级文字 / placeholder / disabled |
| `--border-color` | `#e6e9f0` | 1px 分割线 / 卡片描边 |
| `--bg-page` | `#f2f4fb` | 页面底（叠 radial `#4ade80` 0.16 + linear 浅蓝） |
| `--bg-card` | `#ffffff` | 卡片 / 表面 |
| `--success` | `#2cb0a7` | 成功（与主色复用） |
| `--warning` | `#ffb547` | 警告 |
| `--danger` | `#e5484d` | 危险 / 删除 |
| `--info` | `#2f99ff` | 信息 |

**页面背景**（`body` / `.app-shell`）：

```css
background:
  radial-gradient(circle at top, rgb(74 222 128 / 0.16), transparent 28%),
  linear-gradient(180deg, #f8fafc 0%, #eef5ff 100%);
background-color: #f2f4fb;
```

### 1.2 间距

```text
4 / 8 / 12 / 16 / 20 / 24 / 32
```

### 1.3 圆角

```text
sm   6px
md   8px
lg   12px
pill 999px
```

**删除** 上一轮的 `xl 18px` / `xl 24px` 圆角档。

### 1.4 阴影

仅保留：

```text
card  0 2px 10px rgba(0,0,0,0.05)    ← 卡片轻浮（可选，默认仅 1px 边）
sheet 0 -2px 10px rgba(0,0,0,0.05)  ← 底部 TabBar top shadow
```

**删除** 上一轮的 `sheet: 0 -8px 32px -8px` / `pop: 0 8px 24px -8px`。

### 1.5 字号（PingFang SC 单栈）

```text
text-xs    11px / 1.4
text-sm    12px / 1.5
text-base  13px / 1.55
text-md    14px / 1.55          ← body
text-lg    15px / 1.4   font-weight 600
text-xl    16px / 1.4   font-weight 500   ← TopBar 标题
text-2xl   18px / 1.35  font-weight 600
text-3xl   20px / 1.3   font-weight 600
text-4xl   24px / 1.25  font-weight 700
```

**删除** 上一轮的 `d1~micro` 自定义字号。

### 1.6 字体栈

```text
font-family:
  'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```

**删除** `next/font` 中 Inter / JetBrains Mono 的 import 与字体变量；移除 `tailwind.config.ts` 的 `fontFamily.sans/mono/display` 三套扩展。

### 1.7 不再保留

- tcm 全部旧 token：`ink` / `ink-2` / `ink-3` / `ink-4` / `ink-inverse` / `paper` / `paper-2` / `paper-sunken` / `line` / `line-strong` / `lime` / `lime-ink` / `accent` / `accent-soft` / `warm` / `risk-high` / `risk-mid` / `risk-low`
- `lib/theme.ts` 全部（system/light/dark 三态、matchMedia 监听、setTheme/cycleTheme）
- `components/ui/ThemeToggle.tsx`
- `app/globals.css` 中 `.dark` / `.theme-switching` / `.app-shell` 旧定义

---

## 2. 组件基础层（Primitive）

### 2.1 目录布局

```text
apps/web/
  components/
    ui/                       # 16 个新 Primitive（shadcn 风格 copy-paste）
      button.tsx
      input.tsx
      textarea.tsx
      select.tsx
      dialog.tsx
      sheet.tsx
      toast.tsx
      tabs.tsx
      tab-bar.tsx
      badge.tsx
      card.tsx
      skeleton.tsx
      empty.tsx
      list-row.tsx
      status-dot.tsx
      icon.tsx
    layout/                   # 改写
      top-bar.tsx
      bottom-nav.tsx
      page.tsx                # 通用壳
    patterns/                 # 业务卡（白底 + 状态色点缀）
      risk-card.tsx
      risk-card-compact.tsx
      stat-card.tsx
      task-card.tsx
      token-row.tsx
      hot-topic-item.tsx
      model-row.tsx
      empty-state.tsx
      page-header.tsx
    business/
      mobile.tsx              # barrel re-export
  lib/
    a11y.ts                   # useFocusTrap, useEscape, usePortal
    cn.ts                     # clsx + tailwind-merge
    utils.ts                  # 保留已有
  app/
    globals.css               # 重写
    layout.tsx                # 改 theme-color、移除字体
    (tabs)/
      layout.tsx
      page.tsx                # home
      mine/page.tsx
      profile/page.tsx
      results/page.tsx
      tasks/page.tsx
    accounts/
      new/page.tsx
      [accountId]/page.tsx
      [accountId]/edit/page.tsx
      [accountId]/channels/[channelId]/page.tsx
    tasks/
      new/page.tsx
      records/[id]/page.tsx
      schedules/[id]/page.tsx
      schedules/[id]/edit/page.tsx
    login/page.tsx
  tailwind.config.ts          # 重写
```

### 2.2 a11y 工具

`lib/a11y.ts` 暴露三个 hook：

- `useFocusTrap(ref, active)` — `useEffect` + `keydown` 拦截 Tab/Shift+Tab，循环焦点
- `useEscape(onEscape, active)` — 全局 `keydown` 监听 Esc
- `usePortal(id?)` — `document.body` 挂载点

不引入 `focus-trap-react` / `react-aria` 等库。

### 2.3 Primitive API

| 组件 | Props（核心） | 行为要点 |
|---|---|---|
| `Button` | `variant: 'primary'\|'secondary'\|'ghost'\|'danger'`, `size: 'sm'\|'md'\|'lg'`, `block?`, `loading?`, `disabled?` | 高度 32 / 40 / 48；primary 用 `--primary-color`；tap `scale(0.97)` 80ms |
| `Input` | `value`, `onChange`, `placeholder`, `error?`, `prefix?` | 高度 40，圆角 8，1px 边；聚焦边色变 `--primary-color` |
| `Textarea` | 同 Input + `rows?`, `autoSize?` | 最小 80px |
| `Select` | `value`, `onChange`, `options: {label,value,disabled?}[]`, `placeholder?` | 移动端点击触发 `Sheet`（底弹出选项列表） |
| `Dialog` | `open`, `onOpenChange`, `title?`, `content`, `actions?` | 居中模态 + 半透明遮罩 + 200ms 淡入 + `useFocusTrap` + Esc + 遮罩点击关闭 |
| `Sheet` | `open`, `onOpenChange`, `title?`, `content`, `actions?` | 底部上滑（300ms `sheetUp`）+ 遮罩 + focus trap + Esc |
| `Toast` | `Toast.show({content, duration?, type?})` | 顶部居中 2.5s 自动消失 + 200ms `slideDown` |
| `Tabs` | `value`, `onChange`, `items: {key,label}[]` | 顶部下划线（active 段 2px `--primary-color`） |
| `TabBar` | `activeKey`, `onChange`, `items: {key,label,icon,href?}[]` | 底部 78px 白底 + top shadow；icon 24px，label 10px |
| `Badge` | `variant: 'primary'\|'success'\|'warning'\|'danger'\|'neutral'`, `text` | pill 圆角 999，高度 18，padding 0 6px |
| `Card` | `className?`, `padding?: 'sm'\|'md'\|'lg'` | 白底 + 1px `--border-color` + radius 12 |
| `Skeleton` | `width?`, `height?`, `rounded?` | 浅灰底（`--bg-page`）无 shimmer 动画 |
| `Empty` | `icon?`, `title`, `hint?`, `action?` | 居中堆叠，单色线性 icon 48px |
| `ListRow` | `title`, `description?`, `prefix?`, `suffix?`, `onClick?` | 高度 56，下边线 1px；`onClick` 整行 `scale(0.99)` 80ms |
| `StatusDot` | `status: 'success'\|'warning'\|'danger'\|'neutral'`, `size?: 'sm'\|'md'` | 6 / 8 px 圆点 |
| `Icon` | `name`, `size?`, `className?` | 内置 20+ icon（home / tasks / profile / chevron-left / close / check / eye / plus / trash / search / …） |

### 2.4 Layout 组件

- `TopBar`：sticky top 0，高度 54，白底；左侧 16px chevron-back，中间 16px 标题，右侧 16px 占位；props: `title: string`, `onBack?: () => void`（默认 `router.back()`）
- `BottomNav`：fixed bottom 0，高度 78（含 safe-area），白底 + top shadow；tabs = 首页 / 任务中心 / 我的
- `Page`：通用壳，组合 TopBar（可选）+ 主体 + safe-area bottom padding（= 78px + env(safe-area-inset-bottom)）

### 2.5 动画收敛

`globals.css` 保留 **4 段 keyframes**：

```css
@keyframes sheetUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn     { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
```

**删除** keyframes：`pageEnter` / `rise`（stagger）/ `shimmer` / `pulseEdge`。

**删除** class：`.stagger` / `.page-enter` / `.skeleton`（新版 Skeleton 改用纯色块）/ `.risk-pulse` / `.tap`（重命名为 `.u-press`，仅用于按钮 / ListRow tap 反馈）。

保留 `@media (prefers-reduced-motion: reduce)` 降级。

---

## 3. Pattern 层（业务卡 / 列表行 / 状态徽标 / 空状态 / 页面头）

### 3.1 RiskCard / RiskCardCompact

```
┌──────────────────────────────────┐
│ ┌──┐                             │  ← 左侧 4px 状态色竖条
│ │红│  风险点标题                 │     红 #e5484d / 琥珀 #ffb547 / 绿 #2cb0a7
│ │条│  描述文字（小号灰）         │     描述最多 2 行
│ │  │  · 关联账号 · 02-12 10:24   │     meta 行用 text-xs 灰
│ └──┘                             │
└──────────────────────────────────┘
```

- 容器：白底 + 1px `--border-color` + radius 12
- **删除** `pulseEdge` 动画
- 高风险 = danger / 中 = warning / 低 = success

**Compact 变体**：左侧 4px 条改为右上角 6px StatusDot，整张卡 padding 12，标题 14px。

### 3.2 StatCard

```
┌──────────────────┐
│  活跃账号  [点]  │  ← 标签 + StatusDot
│      128         │  ← 24px 700 数字（tabular-nums）
│   +12 本周       │  ← 12px 灰
└──────────────────┘
```

- 容器同 Card（padding 16）
- 数字用 `font-variant-numeric: tabular-nums`
- **删除** NumberTicker 调用，数字静态渲染

### 3.3 TaskCard

```
┌──────────────────────────────────┐
│ 任务标题                    [运行中]│  ← 标题 + 状态 Badge
│ 关联账号 · 频道名                  │  ← meta 行
│ 触发：每 30 分钟                  │
└──────────────────────────────────┘
```

- 容器同 Card
- 状态 Badge：运行中 = primary / 已停止 = neutral / 失败 = danger / 暂停 = warning
- 整行 `onClick` 跳详情

### 3.4 TokenRow

```
┌──────────────────────────────────┐
│ 频道名              [有效] [操作]│
│ xoxb-••••1234        02-12 授权  │  ← font-mono
└──────────────────────────────────┘
```

- 高度 64，token 用 `'SF Mono', 'Cascadia Code', 'Consolas', monospace`
- 操作区是 `Button size="sm" variant="ghost"`

### 3.5 HotTopicItem / ModelRow

```
┌──────────────────────────────────┐
│ 🔥 热点标题                  ›  │
│ 热度 1.2k · 3 账号覆盖           │
└──────────────────────────────────┘
```

- 高度 56，左侧 emoji / 缩写 16px，右侧 chevron 12px 灰，整行可点击

### 3.6 EmptyState

```
        (icon, 48px, --text-color-3)
        
        暂无数据
        绑定 Token 后开始管理频道
    
        [＋ 新增账号]
```

- 垂直居中堆叠；标题 14px 600；副标题 12px 灰；padding 48 0

### 3.7 PageHeader

```
        页面大标题                 [刷新]
        副标题 / 描述（可选）
```

- 标题 24px 700；副标题 13px 灰；padding 16 0
- 右侧 action 是 `Button size="sm" variant="ghost"`

### 3.8 删除清单

- `components/patterns/NumberTicker.tsx` 整文件删除
- 所有引用 NumberTicker 的位置改为静态数字

### 3.9 颜色使用约束

- 背景只能用 `--bg-card`（白）或 `--bg-page`（淡薰衣草）两种
- 边框只能用 `--border-color`
- 主色 `--primary-color` 只用于：激活态 / 链接 / Button primary / Tab 激活下划线 / RiskCard 状态条
- 状态色（success / warning / danger / info）只用于：Badge / StatusDot / RiskCard 状态条 / 趋势箭头
- 不要再用 `lime` / `accent` / `warm` / `risk-*` / `ink-*` / `paper-*` / `line-*` 这些旧 token

---

## 4. 页面级改写

### 4.1 入口 & 布局

**`app/layout.tsx`（root）**

- 删除 `next/font` 中 Inter / JetBrains Mono 的 `import` / `variable` / className 注入
- `theme-color` meta 改为 `#f2f4fb`
- 删除 `className` 中 `theme-switching` 相关

**`app/globals.css`（重写）**

- 替换为 8 个新颜色变量
- 删除 `.dark`、`.theme-switching`、所有 `.adm-*` 覆盖、`.stagger`、`.page-enter`、`.skeleton`、`.risk-pulse`、`.tap`
- 保留并改写：`.app-shell`、`.page-pad`（重命名为 `.page-shell`）
- body 背景 = radial 顶部绿光 + 浅蓝线性渐变
- 4 段 keyframes：sheetUp / fadeIn / popIn / slideDown
- 保留 `prefers-reduced-motion` 降级

**`tailwind.config.ts`（重写）**

- `theme.extend.colors`：`primary` / `text` / `border` / `bg` / `success` / `warning` / `danger` / `info`
- `theme.extend.fontSize`：9 档
- `theme.extend.borderRadius`：`sm` / `md` / `lg` / `pill`
- 删除 `boxShadow` 自定义（`card` / `sheet` 阴影直接写在 CSS）

### 4.2 Tabs 布局 & 导航

**`app/(tabs)/layout.tsx`**

- 移除 `<div className="page-enter">` 包裹
- 改为 `<div className="page-shell">{children}</div><BottomNav />`
- `.page-shell` padding-bottom = `78px + env(safe-area-inset-bottom)`

**`components/layout/BottomNav.tsx`（重写）**

- 不再 import antd-mobile `TabBar`
- 用新 `TabBar` primitive；tabs = 首页 / 任务中心 / 我的
- 容器 `fixed inset-x-0 bottom-0`，白底，top shadow `0 -2px 10px rgba(0,0,0,0.05)`，高度 78px

**`components/layout/TopBar.tsx`（新建）**

- sticky top 0，高度 54，白底
- 左侧 16px chevron（`Icon name="chevron-left"`）
- 中间 16px 标题
- 右侧 16px 占位

### 4.3 Tabs 内页面

**`app/(tabs)/page.tsx`（首页）**

- import 替换 antd-mobile 的 Button / Dialog / Skeleton / Toast → 新 primitive
- PageHeader action 用 `Button size="sm" variant="ghost"`
- "新增账号" 用 `Button block size="lg" variant="primary"`
- 列表用 `<ul className="space-y-3">`，每项用 `AccountCard`（业务组件）
- 空态用 `EmptyState`
- 删除 `surface rounded-lg p-4` 类名

**`app/(tabs)/tasks/page.tsx`（任务中心）**

- 同首页结构：PageHeader + 列表
- 列表项用 `TaskCard`
- 顶部筛选用 `Tabs`（running / stopped / failed）

**`app/(tabs)/mine/page.tsx`（我的）**

- 顶部用户信息卡（白底 Card + 头像 + 昵称）
- 下方多个分组，每组 `ListRow` 列出菜单项
- 退出登录：`Button block variant="danger"` + `Dialog` 二次确认

**`app/(tabs)/profile/page.tsx`**

- 三个分组（账号 / Token / 模型）都用 Card 包裹
- 账号分组用 `ListRow`
- Token 分组用 `TokenRow`
- 模型分组用 `ModelRow`

**`app/(tabs)/results/page.tsx`**

- 顶部 `Tabs`（成功 / 失败 / 全部）
- 列表用 `HotTopicItem`
- 二次确认用 `Sheet`

### 4.4 accounts/* 路由

- `accounts/new/page.tsx` — TopBar + 白底 Card 表单（Input / Textarea / Select）+ 底部 sticky `Button block size="lg" variant="primary"`
- `accounts/[accountId]/page.tsx` — TopBar + 顶部 Card 基本信息 + 中部 Token 列表（TokenRow）+ 底部删除（danger，Dialog 二次确认）
- `accounts/[accountId]/edit/page.tsx` — TopBar + 同 new 结构
- `accounts/[accountId]/channels/[channelId]/page.tsx` — TopBar + Card 频道信息 + Token 列表

### 4.5 tasks/* 路由

- `tasks/new/page.tsx` — TopBar + 表单（Select 触发方式 / Select 关联账号 / Select 关联频道 / Select 动作类型 / Textarea 参数）+ sticky `Button block`
- `tasks/schedules/[id]/page.tsx` — TopBar + Card 列表显示参数 + 启用状态
- `tasks/schedules/[id]/edit/page.tsx` — TopBar + 同 new 表单
- `tasks/records/[id]/page.tsx` — TopBar + 状态行 Badge + StatusDot + 详情 ListRow 分组

### 4.6 login

**`login/page.tsx`**

- 整页继承 `body` 渐变背景
- 居中白底 Card：max-width 320，padding 24，radius 12
- 顶部 brand wordmark（24px 700 青蓝）+ 副标题（12px 灰）
- 中部账号名 Input + Token Input（mono）
- 底部 `Button block size="lg" variant="primary"`
- 错误用 Input 的 `error` prop + 红边框 + 12px 提示

### 4.7 components 整理

**`components/business/Mobile.tsx`**

- 重写为纯 barrel re-export
- 保持 `export { AccountCard, EmptyPanel, PageHeader, ... } from '@/components/patterns/xxx'` 兼容旧 import
- `EmptyPanel` 别名指向 `EmptyState`

**删除**

- `components/patterns/NumberTicker.tsx`
- `components/ui/ThemeToggle.tsx`
- `lib/theme.ts`

**保留并改写**

- `components/ui/Button.tsx` / `Input.tsx` / `Textarea.tsx` / `Select.tsx` / `Card.tsx` / `Sheet.tsx` / `Badge.tsx` / `Segmented.tsx`
- `components/patterns/*` 全部按第 3 节重写

### 4.8 配置 & 公共资源

- `apps/web/.env` / `.env.example` 保持
- `public/manifest.json`（如有）— `theme_color` / `background_color` 改为 `#f2f4fb`
- `public/pwa/*` icon 资源保持

### 4.9 数据 / 后端 / 域模型（**不动**）

- `lib/api.ts`、`lib/domain.ts`
- `apps/api/**`、`apps/worker/**`
- `packages/db/**`、`packages/shared/**`
- Prisma schema、API 路由

---

## 5. 验证策略

### 5.1 自动化

| 检查 | 命令 | 通过标准 |
|---|---|---|
| TypeScript | `npm -w apps/web run typecheck` | 0 error |
| ESLint | `npm -w apps/web run lint` | 0 error |
| Next build | `npm -w apps/web run build` | 编译通过，无 hydration warning |
| Mock 启动 | `NEXT_PUBLIC_USE_MOCK=1 npm -w apps/web run dev` | 启动 < 5s |

### 5.2 视觉验证清单

启动后用 Chrome DevTools iPhone 14 Pro 模拟（375×812）逐项检查，对比 quantora 同位页面：

**视觉系统**
- [ ] 页面背景 = 淡薰衣草蓝 + 顶部 radial 绿光
- [ ] 卡片白底 + 1px 浅灰边，无阴影（除 TabBar）
- [ ] 字体栈统一 PingFang SC，无 Inter / JetBrains Mono 回退痕迹
- [ ] 主色按钮 / 激活 Tab 下划线 / 链接 = 青蓝

**首页 / 任务 / 我的 / profile / results / accounts / tasks / login 8 处**
- [ ] 页面大标题 = text-4xl 700
- [ ] 输入框聚焦时边色变青蓝
- [ ] 错误信息显示在字段下方，不破坏版式
- [ ] 列表用 Card / ListRow 白底 + 1px 边
- [ ] 状态用 Badge / StatusDot，无 pulse 动画
- [ ] 二次确认用 Sheet / Dialog

**底部导航**
- [ ] 3 格：首页 / 任务中心 / 我的
- [ ] 白底 + top shadow，无主题切换格
- [ ] 选中态 = 青蓝

**响应式**
- [ ] 375px 宽不溢出
- [ ] 480px 上限生效
- [ ] 触摸目标 ≥ 44px
- [ ] safe-bottom 生效

**可访问性**
- [ ] Dialog / Sheet 打开时 focus trap 正常
- [ ] Esc 关闭 Dialog / Sheet
- [ ] `prefers-reduced-motion: reduce` 时所有动画降级

### 5.3 浏览器兼容

- iOS Safari 16+（主战场）
- Android Chrome 最新
- 桌面 Chrome / Safari / Firefox 验证布局

### 5.4 收尾扫尾

- `grep -r "antd-mobile" apps/web` 确认 0 命中
- `grep -r "Inter\|JetBrains" apps/web` 确认 0 命中（除可能的注释 / public 资源）
- `grep -r "ink-\|paper-\|line-\|lime-\|accent-\|warm-\|risk-" apps/web/components apps/web/app` 确认 0 命中
- `grep -r "NumberTicker" apps/web` 确认 0 命中
- `grep -r "stagger\|page-enter\|shimmer\|pulseEdge\|theme-switching" apps/web` 确认 0 命中

---

## 6. 范围外（明确不做）

- 新功能（保持现有页面与路由不变）
- 后端 / API 改动
- 引入 Framer Motion / GSAP / React Spring 等动画库
- 引入 Radix UI / Headless UI / React Aria / Ark UI 等组件库
- 引入 `focus-trap-react` / `react-focus-lock` 等 a11y 库
- 引入图标库（Lucide / Heroicons / Tabler）
- 引入 `next/font` 字体（自托管或 Google）
- i18n 框架
- 复杂动效（滚动驱动 / pin / scrub / morph）
- 暗色模式

---

## 7. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 一个 PR 体量过大 | 拆 3 个 commit 顺序提交：`feat: ui primitives` → `feat: pattern components` → `feat: page migration`；合并前 review |
| 移除 Inter / JetBrains Mono 后数字 / 英文混排视觉有差异 | 浏览器逐页比对，调字号档位；tabular-nums 兜底 |
| antd-mobile 未迁完的 import 残留 | 收尾 grep `antd-mobile` 必须为 0 |
| 旧 token 残留 | 收尾 grep `ink-/paper-/line-/lime-/accent-/warm-/risk-` 必须为 0 |
| Dialog / Sheet 焦点陷阱手写易出错 | 用统一的 `useFocusTrap`；Tab 键遍历验证 |
| PingFang SC 在非苹果设备回退 | 字体栈包含 Hiragino Sans GB / Microsoft YaHei 兜底 |
| 移动端 Sheet 滑动下拖关闭（基础版未做） | 明确不做；仅点击遮罩 / Esc / 取消按钮关闭 |

---

## 8. 决策日志

| 决策 | 选项 | 选择 | 理由 |
|---|---|---|---|
| 重构深度 | 视觉基因克隆 / 主题色+表层借鉴 / 彻底重写 | 彻底重写 | 与 quantora 观感最贴近，用户明确要求 |
| 组件基础层 | shadcn 风格手写 / Radix Primitives / React Aria / 保留 antd-mobile | shadcn 风格手写 | 零外部黑盒、与 quantora 风格 1:1 映射、API 可控 |
| 暗色模式 | 完全去掉 / 保留三态 / 先去掉后续加 | 完全去掉 | quantora 无暗色、与彻底重写一致 |
| 落地节奏 | 一轮 / 两轮 / 多轮 | 一轮 | 用户明确要求一次性重写 |
| 动画 | 全删 / 只留交互过渡 / 保留装饰 | 只留交互过渡 | Sheet / Dialog / Toast / 按钮 tap 必要 |
| 字体栈 | PingFang SC 单栈 / 保留 Inter / 混合 | PingFang SC 单栈 | quantora 一致、文件体积小 |
| 主色 | 青蓝 / 保留 lime / 其他 | 青蓝 #2cb0a7 | quantora 主色 |
| 背景 | 纯色 / 渐变 | radial + linear 渐变 | quantora 既有渐变 |

---

## 9. 实施顺序

由于"一轮提交"约束，实施按以下顺序，但**全部在同一个分支 / 同一个 PR 内完成**：

1. **基础层**：`tailwind.config.ts` 重写、`globals.css` 重写、`app/layout.tsx` 字体移除 / theme-color 改、`lib/cn.ts` 新建
2. **Primitive 层**：16 个 `components/ui/*` + `lib/a11y.ts`
3. **Layout 组件**：`TopBar` / `BottomNav` / `Page`
4. **Pattern 层**：9 个 `components/patterns/*`（重写，删除 NumberTicker）
5. **Tabs 入口 & tabs 4 页 + profile + results** 重写
6. **accounts/* 4 页 + tasks/* 4 页 + login 1 页** 重写
7. **业务包 barrel**：`components/business/Mobile.tsx` 重写为纯 re-export
8. **收尾扫尾**：5.4 节 grep 清单

Git commit 顺序建议拆 3 个（review 友好）：

- `feat(ui): rebuild primitives + tokens (quantora style)`
- `feat(ui): rewrite pattern components + bottom nav`
- `feat(ui): migrate all pages to new primitives`

---

## 10. 关联文件

- 参考实现：`D:\Work\web\quantora-ai-h5`
- 上一轮设计（**作废**）：`docs/superpowers/specs/2026-06-06-tencent-channel-ui-redesign-design.md`
- 上一轮 plan（**作废**）：`docs/superpowers/plans/2026-06-06-tencent-channel-ui-redesign.md`
- 现有实现：`apps/web/`
