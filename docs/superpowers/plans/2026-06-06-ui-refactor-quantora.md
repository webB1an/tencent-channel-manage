# 腾讯频道运营助手 · UI 重构实施计划 (quantora 调性)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `apps/web` 的视觉层从 ink+lime 编辑式重构,完全切换到 quantora 调性(青蓝 #2cb0a7 + 淡薰衣草背景 + PingFang SC 单栈 + shadcn 风格原语),所有页面在同分支/同 PR 内一次性重写,中途拆 3 个 review-friendly commit。

**Architecture:** 三层 — `components/ui/*` shadcn 风格 copy-paste 原语(20 个) → `components/patterns/*` 业务卡(14 个) + `components/layout/*` 布局壳(TopBar/BottomNav/Page) → `app/**` 页面用前两层组合而成。`lib/a11y.ts` 手写 focus-trap / escape / portal,无外部 a11y 库。

**Tech Stack:** Next.js 14 App Router · React 18 · TypeScript 5 · Tailwind CSS 3.4 · 自托管 SVG icon(无图标库) · 零新依赖(除 `clsx` + `tailwind-merge` 用于 `lib/cn.ts`)。

**Reference Spec:** `docs/superpowers/specs/2026-06-06-ui-refactor-quantora-style-design.md`
**Reference Implementation:** `D:\Work\web\quantora-ai-h5` (Vue 3 + Vant 4)

---

## 文件结构总览

实施完成后 `apps/web` 应呈现:

```
apps/web/
  app/
    globals.css               # 重写
    layout.tsx                # 改写
    (tabs)/
      layout.tsx              # 改写
      page.tsx                # 首页 (改写)
      mine/page.tsx           # 改写
      tasks/page.tsx          # 改写
    accounts/
      new/page.tsx            # 改写
      [accountId]/page.tsx    # 改写
      [accountId]/edit/page.tsx
      [accountId]/channels/[channelId]/page.tsx
    tasks/
      new/page.tsx            # 改写 (4 步向导)
      schedules/[id]/page.tsx
      schedules/[id]/edit/page.tsx
      records/[id]/page.tsx
  components/
    ui/                       # 20 个新 Primitive
      button.tsx
      input.tsx
      textarea.tsx
      select.tsx
      switch.tsx
      checkbox.tsx
      radio.tsx
      date-picker.tsx
      dialog.tsx
      sheet.tsx
      toast.tsx
      tabs.tsx
      tab-bar.tsx
      badge.tsx
      status-dot.tsx
      card.tsx
      skeleton.tsx
      empty.tsx
      list-row.tsx
      icon.tsx
    layout/                   # 3 个布局壳
      top-bar.tsx
      bottom-nav.tsx          # 改写
      page.tsx
    patterns/                 # 14 个业务卡
      page-header.tsx
      empty-state.tsx
      field-label.tsx
      message.tsx
      token-text.tsx
      status-badge.tsx
      token-row.tsx
      stat-card.tsx
      risk-card.tsx
      risk-card-compact.tsx
      hot-topic-item.tsx
      model-row.tsx
      account-card.tsx
      channel-card.tsx
      task-template-card.tsx
      scheduled-task-card.tsx
      execution-record-card.tsx
      step-indicator.tsx
    business/
      mobile.tsx              # barrel re-export
  lib/
    cn.ts                     # clsx + tailwind-merge
    a11y.ts                   # useFocusTrap / useEscape / usePortal
    utils.ts                  # 保留
    api.ts                    # 不动
    domain.ts                 # 不动
  tailwind.config.ts          # 重写

# 整文件删除
  components/patterns/NumberTicker.tsx
  components/ui/ThemeToggle.tsx
  components/ui/Segmented.tsx          # 改用新的 Tabs primitive
  lib/theme.ts
```

---

## Commit 1:基础层 + 20 个 Primitive

### Task 1.1:重写 `tailwind.config.ts`

**Files:**
- Modify: `apps/web/tailwind.config.ts` (整文件重写)

- [ ] **Step 1:替换 colors 扩展**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          soft: "var(--primary-soft)",
        },
        text: {
          DEFAULT: "var(--text-color)",
          2: "var(--text-color-2)",
          3: "var(--text-color-3)",
        },
        border: "var(--border-color)",
        bg: {
          page: "var(--bg-page)",
          card: "var(--bg-card)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["12px", { lineHeight: "1.5" }],
        base: ["13px", { lineHeight: "1.55" }],
        md: ["14px", { lineHeight: "1.55" }],
        lg: ["15px", { lineHeight: "1.4", fontWeight: "600" }],
        xl: ["16px", { lineHeight: "1.4", fontWeight: "500" }],
        "2xl": ["18px", { lineHeight: "1.35", fontWeight: "600" }],
        "3xl": ["20px", { lineHeight: "1.3", fontWeight: "600" }],
        "4xl": ["24px", { lineHeight: "1.25", fontWeight: "700" }],
      },
      fontFamily: {
        sans: ["'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "sans-serif"],
        mono: ["'SF Mono'", "'Cascadia Code'", "'Consolas'", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        pill: "999px",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2:验证类型**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && npm -w apps/web run typecheck
```

预期:此步在后续 Task 1.2 写完 globals.css 后才能跑(当前无 `--primary-color` 等变量会 lint 报 undefined)。先继续 Task 1.2。

- [ ] **Step 3:Commit**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/tailwind.config.ts && \
  git commit -m "feat(ui): rewrite tailwind tokens to quantora palette"
```

---

### Task 1.2:重写 `app/globals.css`

**Files:**
- Modify: `apps/web/app/globals.css` (整文件重写)

- [ ] **Step 1:替换内容**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #2cb0a7;
  --primary-soft: #d3f1ee;
  --text-color: #1d2132;
  --text-color-2: #5b6478;
  --text-color-3: #9097a8;
  --border-color: #e6e9f0;
  --bg-page: #f2f4fb;
  --bg-card: #ffffff;
  --success: #2cb0a7;
  --warning: #ffb547;
  --danger: #e5484d;
  --info: #2f99ff;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  color-scheme: light;
}

html, body {
  height: 100%;
  background: #f2f4fb;
  color: var(--text-color);
  -webkit-tap-highlight-color: transparent;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

body {
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

* { box-sizing: border-box; }

button { -webkit-appearance: none; appearance: none; }
input, textarea, select, button { font: inherit; }

.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgb(74 222 128 / 0.16), transparent 28%),
    linear-gradient(180deg, #f8fafc 0%, #eef5ff 100%);
  background-color: var(--bg-page);
}

.page-shell {
  padding: 14px 14px calc(78px + var(--safe-bottom));
}

.surface {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.u-press {
  transition: transform 80ms cubic-bezier(0.22, 1, 0.36, 1), opacity 80ms cubic-bezier(0.22, 1, 0.36, 1);
}
.u-press:active { transform: scale(0.97); opacity: 0.85; }

.u-row-press:active { transform: scale(0.99); }

.tabular { font-variant-numeric: tabular-nums; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes sheetUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn     { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.anim-sheet-up   { animation: sheetUp 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-fade-in    { animation: fadeIn 200ms ease-out both; }
.anim-pop-in     { animation: popIn 180ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-slide-down { animation: slideDown 220ms cubic-bezier(0.22, 1, 0.36, 1) both; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2:确认旧定义已删除**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  grep -nE "\.dark|\.theme-switching|\.stagger|\.page-enter|shimmer|pulseEdge|\.skeleton\{|\.risk-pulse|\.tap:" apps/web/app/globals.css
```

预期:无输出(0 行命中)。

- [ ] **Step 3:Commit (合并到 Task 1.3 一次提交)**

留到 Task 1.3 一起 commit。

---

### Task 1.3:改写 `app/layout.tsx` (移除字体 + 改 theme-color)

**Files:**
- Modify: `apps/web/app/layout.tsx` (整文件重写)

- [ ] **Step 1:替换内容**

```tsx
import "./globals.css";
import type { ReactNode } from "react";
import type { Viewport } from "next";

export const metadata = {
  title: "腾讯频道运营助手",
  description: "AI 辅助的频道运营工作台",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f2f4fb",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell mx-auto min-h-screen w-full max-w-[430px]">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 2:跑 typecheck + lint**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  npm -w apps/web run typecheck && \
  npm -w apps/web run lint
```

预期:typecheck 可能因后续 Task 1.4 之后才彻底通过(还有 antd-mobile 引用),lint 应通过。如 typecheck 报 antd-mobile 残留,先继续到 Task 1.11-1.18 后再统一跑。

- [ ] **Step 3:Commit**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/app/globals.css apps/web/app/layout.tsx && \
  git commit -m "feat(ui): rewrite globals.css + root layout (quantora palette, no fonts)"
```

---

### Task 1.4:新建 `lib/cn.ts` (clsx + tailwind-merge)

**Files:**
- Create: `apps/web/lib/cn.ts`
- Modify: `apps/web/package.json` (添加 clsx + tailwind-merge)

- [ ] **Step 1:安装依赖**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  npm -w apps/web install clsx tailwind-merge
```

- [ ] **Step 2:写 lib/cn.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3:删除 lib/utils.ts 中的旧 cn**

`lib/utils.ts` 中 `export function cn(...)` 整段删除,保留 `formatRelativeTime` / `formatLocalDate`。

- [ ] **Step 4:Commit**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/lib/cn.ts apps/web/lib/utils.ts apps/web/package.json apps/web/package-lock.json && \
  git commit -m "feat(ui): add lib/cn.ts (clsx + tailwind-merge)"
```

---

### Task 1.5:新建 `lib/a11y.ts` (手写 a11y hooks)

**Files:**
- Create: `apps/web/lib/a11y.ts`

- [ ] **Step 1:写文件**

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const root = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusable();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const items = focusable();
    items[0]?.focus();
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}

export function useEscape(onEscape: () => void, active: boolean) {
  const cb = useRef(onEscape);
  cb.current = onEscape;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);
}

export function usePortal(id = "ui-portal") {
  return useCallback((node: HTMLElement | null) => {
    if (typeof document === "undefined") return;
    let host = document.getElementById(id);
    if (!host) {
      host = document.createElement("div");
      host.id = id;
      document.body.appendChild(host);
    }
    if (node) host.appendChild(node);
  }, [id]);
}
```

- [ ] **Step 2:Commit**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/lib/a11y.ts && \
  git commit -m "feat(ui): add a11y hooks (focus-trap, escape, portal)"
```

---

### Task 1.6:Primitive — `components/ui/icon.tsx`

**Files:**
- Create: `apps/web/components/ui/icon.tsx`

- [ ] **Step 1:写文件**

```tsx
import type { SVGProps } from "react";

type IconName =
  | "chevron-left" | "chevron-right" | "close" | "check"
  | "home" | "tasks" | "profile"
  | "plus" | "trash" | "search" | "edit" | "eye" | "eye-off"
  | "calendar" | "clock" | "alert-triangle" | "info";

const paths: Record<IconName, React.ReactNode> = {
  "chevron-left": <path d="M15 6 9 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "chevron-right": <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "close": <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "check": <path d="m5 12 5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  "home": <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "tasks": <><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M8 3v4M16 3v4M4 10h16M8 14l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "profile": <><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" /><path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "plus": <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  "trash": <><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  "search": <><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "edit": <path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "eye": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></>,
  "eye-off": <><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M10.5 6.7A11 11 0 0 1 12 6.5c6.5 0 10 5.5 10 5.5a18 18 0 0 1-3.1 3.7M6.5 7.7C3.5 9.7 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "calendar": <><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "clock": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "alert-triangle": <><path d="M12 3 2 21h20L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 10v5M12 18v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
  "info": <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 11v6M12 8v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></>,
};

export function Icon({ name, size = 16, className, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
```

- [ ] **Step 2:Commit (合并到 Task 1.20 一次提交)**

留到最后。

---

### Task 1.7:Primitive — `components/ui/button.tsx`

**Files:**
- Create: `apps/web/components/ui/button.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary text-white hover:brightness-105 active:brightness-95",
  secondary: "bg-bg-card text-text border border-border hover:bg-primary-soft",
  ghost: "bg-transparent text-text hover:bg-primary-soft",
  danger: "bg-danger text-white hover:brightness-105",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-md",
  lg: "h-12 px-5 text-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", block, loading, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "u-press inline-flex items-center justify-center gap-1.5 rounded-md font-medium select-none disabled:opacity-50 disabled:pointer-events-none",
        variantClass[variant],
        sizeClass[size],
        block && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
});
```

- [ ] **Step 2:Commit (合并到 Task 1.20)**

留到最后。

---

### Task 1.8:Primitive — `components/ui/card.tsx`

**Files:**
- Create: `apps/web/components/ui/card.tsx`

- [ ] **Step 1:写文件**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, padding = "md", ...rest }: HTMLAttributes<HTMLDivElement> & { padding?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-card",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        className
      )}
      {...rest}
    />
  );
}
```

---

### Task 1.9:Primitive — `components/ui/input.tsx`

**Files:**
- Create: `apps/web/components/ui/input.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  prefix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, prefix, ...rest },
  ref
) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-md border bg-bg-card px-3 transition-colors",
        "border-border focus-within:border-primary",
        error && "border-danger focus-within:border-danger"
      )}
    >
      {prefix && <span className="text-text-3">{prefix}</span>}
      <input
        ref={ref}
        className={cn("h-full w-full bg-transparent text-md text-text placeholder:text-text-3 focus:outline-none", className)}
        {...rest}
      />
    </div>
  );
});
```

---

### Task 1.10:Primitive — `components/ui/textarea.tsx`

**Files:**
- Create: `apps/web/components/ui/textarea.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "block w-full rounded-md border bg-bg-card p-3 text-md text-text placeholder:text-text-3 transition-colors focus:outline-none focus:border-primary",
        "border-border",
        error && "border-danger",
        className
      )}
      {...rest}
    />
  );
});
```

---

### Task 1.11:Primitive — `components/ui/select.tsx`

**Files:**
- Create: `apps/web/components/ui/select.tsx`

`Select` 在移动端通过 `Sheet` 弹出选项。`Sheet` 是本任务依赖项 — 同步实现(见 Task 1.16)。

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { Sheet } from "./sheet";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "请选择",
  title,
  className,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 text-left text-md text-text u-press",
          !current && "text-text-3",
          className
        )}
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <Icon name="chevron-right" size={14} className="text-text-3" />
      </button>
      <Sheet open={open} onOpenChange={setOpen} title={title ?? "请选择"}>
        <ul className="divide-y divide-border">
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                disabled={o.disabled}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-md u-press",
                  o.value === value && "text-primary",
                  o.disabled && "opacity-40 pointer-events-none"
                )}
              >
                <span>{o.label}</span>
                {o.value === value && <Icon name="check" size={16} />}
              </button>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
```

---

### Task 1.12:Primitive — `components/ui/switch.tsx`

**Files:**
- Create: `apps/web/components/ui/switch.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { cn } from "@/lib/cn";

export function Switch({ checked, onChange, disabled, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-pill transition-colors u-press",
        checked ? "bg-primary" : "bg-border",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
```

---

### Task 1.13:Primitive — `components/ui/checkbox.tsx`

**Files:**
- Create: `apps/web/components/ui/checkbox.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Checkbox({ checked, onChange, disabled, children }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; children?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-2 select-none", disabled && "opacity-50 pointer-events-none")}>
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className={cn("h-4 w-4 rounded border bg-bg-card transition-colors", checked ? "border-primary bg-primary" : "border-border")}>
          {checked && <Icon name="check" size={12} className="text-white" />}
        </span>
      </span>
      {children && <span className="text-md text-text">{children}</span>}
    </label>
  );
}

export function CheckboxGroup<T extends string>({ value, onChange, children }: { value: T[]; onChange: (v: T[]) => void; children: React.ReactNode }) {
  return (
    <CheckboxGroupInner value={value} onChange={onChange}>{children}</CheckboxGroupInner>
  );
}

function CheckboxGroupInner<T extends string>({ value, onChange, children }: { value: T[]; onChange: (v: T[]) => void; children: React.ReactNode }) {
  // children 期望为 <Checkbox value="x" /> 列表,通过 children.props 抓 value
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as Array<{ props: { value: T; checked: boolean; onChange: (v: boolean) => void } }>;
  return (
    <div className="space-y-2">
      {items.map((child, i) => {
        const childValue = child.props.value;
        return (
          <Checkbox
            key={String(childValue) + i}
            checked={value.includes(childValue)}
            onChange={(c) => onChange(c ? [...value, childValue] : value.filter((x) => x !== childValue))}
          >
            {(child.props as { children?: ReactNode }).children}
          </Checkbox>
        );
      })}
    </div>
  );
}
```

---

### Task 1.14:Primitive — `components/ui/radio.tsx`

**Files:**
- Create: `apps/web/components/ui/radio.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Radio({ checked, onChange, disabled, children, name, value }: { checked: boolean; onChange: () => void; disabled?: boolean; children?: ReactNode; name?: string; value?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center gap-2 select-none", disabled && "opacity-50 pointer-events-none")}>
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          id={id}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className={cn("h-4 w-4 rounded-full border bg-bg-card transition-colors", checked ? "border-primary" : "border-border")}>
          {checked && <span className="block h-2 w-2 rounded-full bg-primary" />}
        </span>
      </span>
      {children && <span className="text-md text-text">{children}</span>}
    </label>
  );
}

export function RadioGroup<T extends string>({ value, onChange, name, children }: { value: T; onChange: (v: T) => void; name?: string; children: ReactNode }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean) as Array<{ props: { value: T; disabled?: boolean; children?: ReactNode } }>;
  return (
    <div className="space-y-2">
      {items.map((child, i) => (
        <Radio
          key={String(child.props.value) + i}
          name={name}
          value={String(child.props.value)}
          checked={value === child.props.value}
          onChange={() => onChange(child.props.value)}
          disabled={child.props.disabled}
        >
          {child.props.children}
        </Radio>
      ))}
    </div>
  );
}
```

---

### Task 1.15:Primitive — `components/ui/tabs.tsx`

**Files:**
- Create: `apps/web/components/ui/tabs.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { cn } from "@/lib/cn";

export interface TabItem { key: string; label: string }

export function Tabs<T extends string>({ value, onChange, items, className }: { value: T; onChange: (v: T) => void; items: TabItem[]; className?: string }) {
  return (
    <div role="tablist" className={cn("flex border-b border-border bg-bg-card", className)}>
      {items.map((it) => {
        const active = it.key === value;
        return (
          <button
            key={it.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key as T)}
            className={cn(
              "relative flex-1 py-3 text-center text-md transition-colors u-press",
              active ? "text-primary" : "text-text-2"
            )}
          >
            {it.label}
            {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
```

---

### Task 1.16:Primitive — `components/ui/sheet.tsx`

**Files:**
- Create: `apps/web/components/ui/sheet.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useEscape } from "@/lib/a11y";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Sheet({ open, onOpenChange, title, children, actions }: { open: boolean; onOpenChange: (v: boolean) => void; title?: string; children: ReactNode; actions?: ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscape(() => onOpenChange(false), open);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof document === "undefined" || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 anim-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[80vh] rounded-t-lg bg-bg-card anim-sheet-up",
          "shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-lg text-text">{title}</h3>
          <button onClick={() => onOpenChange(false)} className="text-text-3 u-press" aria-label="关闭">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="max-h-[calc(80vh-56px-env(safe-area-inset-bottom))] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
        {actions && <div className="border-t border-border p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}
```

---

### Task 1.17:Primitive — `components/ui/dialog.tsx`

**Files:**
- Create: `apps/web/components/ui/dialog.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap, useEscape } from "@/lib/a11y";
import { cn } from "@/lib/cn";

export function Dialog({ open, onOpenChange, title, content, actions }: { open: boolean; onOpenChange: (v: boolean) => void; title?: string; content: ReactNode; actions?: ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscape(() => onOpenChange(false), open);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (typeof document === "undefined" || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40 anim-fade-in" onClick={() => onOpenChange(false)} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn("relative w-full max-w-[320px] rounded-lg bg-bg-card p-5 anim-pop-in")}
      >
        {title && <h3 className="text-xl text-text">{title}</h3>}
        <div className="mt-2 text-md text-text-2">{content}</div>
        {actions && <div className="mt-5 flex gap-2">{actions}</div>}
      </div>
    </div>,
    document.body
  );
}
```

---

### Task 1.18:Primitive — `components/ui/toast.tsx`

**Files:**
- Create: `apps/web/components/ui/toast.tsx`

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type ToastType = "info" | "success" | "error";

interface ToastState { id: number; content: ReactNode; type: ToastType }

let counter = 0;
const listeners = new Set<(t: ToastState) => void>();

export const Toast = {
  show(opts: { content: ReactNode; duration?: number; type?: ToastType }) {
    const item: ToastState = { id: ++counter, content: opts.content, type: opts.type ?? "info" };
    listeners.forEach((l) => l(item));
  },
};

export function ToastHost() {
  const [items, setItems] = useState<ToastState[]>([]);

  useEffect(() => {
    const onItem = (t: ToastState) => {
      setItems((arr) => [...arr, t]);
      window.setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== t.id)), 2500);
    };
    listeners.add(onItem);
    return () => { listeners.delete(onItem); };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[calc(16px+env(safe-area-inset-top))]">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto rounded-md px-4 py-2 text-sm text-white shadow-md anim-slide-down",
            t.type === "success" && "bg-success",
            t.type === "error" && "bg-danger",
            t.type === "info" && "bg-text"
          )}
        >
          {t.content}
        </div>
      ))}
    </div>,
    document.body
  );
}
```

**重要**:`ToastHost` 需要挂在 `app/layout.tsx` 的 body 内(在 Task 1.3 的 layout 改写时,后面 Task 1.20 commit 之前手动追加此 import 与组件)。

---

### Task 1.19:Primitive — `components/ui/tab-bar.tsx` + `badge.tsx` + `status-dot.tsx` + `skeleton.tsx` + `empty.tsx` + `list-row.tsx`

**Files:**
- Create: `apps/web/components/ui/tab-bar.tsx`
- Create: `apps/web/components/ui/badge.tsx`
- Create: `apps/web/components/ui/status-dot.tsx`
- Create: `apps/web/components/ui/skeleton.tsx`
- Create: `apps/web/components/ui/empty.tsx`
- Create: `apps/web/components/ui/list-row.tsx`

- [ ] **Step 1:写 `tab-bar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface TabBarItem { key: string; label: string; icon: ReactNode; href?: string }

export function TabBar({ activeKey, items, onChange }: { activeKey: string; items: TabBarItem[]; onChange: (key: string) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{ height: 78, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="主导航"
    >
      <div className="flex h-full">
        {items.map((it) => {
          const active = it.key === activeKey;
          const node = (
            <button
              type="button"
              onClick={() => onChange(it.key)}
              className={cn("flex h-full flex-1 flex-col items-center justify-center gap-0.5 u-press", active ? "text-primary" : "text-text-3")}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex h-6 w-6 items-center justify-center">{it.icon}</span>
              <span className="text-[10px]">{it.label}</span>
            </button>
          );
          return it.href ? <Link key={it.key} href={it.href} className="flex-1">{node}</Link> : <div key={it.key} className="flex-1">{node}</div>;
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2:写 `badge.tsx`**

```tsx
import { cn } from "@/lib/cn";

type Variant = "primary" | "success" | "warning" | "danger" | "neutral";

const variantClass: Record<Variant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-primary-soft text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-border text-text-2",
};

export function Badge({ variant = "neutral", text, className }: { variant?: Variant; text: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-[18px] items-center rounded-pill px-1.5 text-[11px] font-medium", variantClass[variant], className)}>
      {text}
    </span>
  );
}
```

- [ ] **Step 3:写 `status-dot.tsx`**

```tsx
import { cn } from "@/lib/cn";

type Status = "success" | "warning" | "danger" | "neutral" | "primary";
const colorClass: Record<Status, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-text-3",
  primary: "bg-primary",
};

export function StatusDot({ status, size = "md" }: { status: Status; size?: "sm" | "md" }) {
  return <span className={cn("inline-block rounded-full", colorClass[status], size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} aria-hidden />;
}
```

- [ ] **Step 4:写 `skeleton.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function Skeleton({ width, height = 16, rounded = "sm", className }: { width?: number | string; height?: number | string; rounded?: "sm" | "md" | "pill"; className?: string }) {
  return (
    <span
      className={cn("inline-block bg-bg-page align-middle", rounded === "sm" && "rounded-sm", rounded === "md" && "rounded-md", rounded === "pill" && "rounded-pill", className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}
```

- [ ] **Step 5:写 `empty.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function Empty({ title, hint, action, className }: { title: string; hint?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <Icon name="info" size={48} className="text-text-3" />
      <p className="mt-3 text-md font-semibold text-text">{title}</p>
      {hint && <p className="mt-1 text-sm text-text-3">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 6:写 `list-row.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

export function ListRow({ title, description, prefix, suffix, onClick, className }: { title: ReactNode; description?: ReactNode; prefix?: ReactNode; suffix?: ReactNode; onClick?: () => void; className?: string }) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex min-h-[56px] items-center gap-3 border-b border-border bg-bg-card px-4 py-3",
        interactive && "u-row-press cursor-pointer",
        className
      )}
    >
      {prefix && <span className="flex h-6 w-6 items-center justify-center text-text-3">{prefix}</span>}
      <div className="min-w-0 flex-1">
        <div className="text-md text-text">{title}</div>
        {description && <div className="mt-0.5 text-sm text-text-3">{description}</div>}
      </div>
      {suffix !== undefined && <span className="text-sm text-text-3">{suffix ?? <Icon name="chevron-right" size={14} className="text-text-3" />}</span>}
    </div>
  );
}
```

---

### Task 1.20:Primitive — `components/ui/date-picker.tsx`

**Files:**
- Create: `apps/web/components/ui/date-picker.tsx`

- [ ] **Step 1:写文件**

轻量日期+时间选择器,弹出 Sheet 后三列滚轮(Y/M/D 或 H/M)。可后续替换为更复杂的实现,这一版只覆盖分钟精度的"每日时间"和"单次时间"两种用法。

```tsx
"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Sheet } from "./sheet";
import { Button } from "./button";
import { Icon } from "./icon";

interface DatePickerProps {
  value: Date;
  onChange: (d: Date) => void;
  mode?: "datetime" | "date" | "time";
  title?: string;
  triggerClassName?: string;
  min?: Date;
  buttonLabel?: (v: Date, mode: "datetime" | "date" | "time") => string;
}

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(d: Date, mode: "datetime" | "date" | "time") {
  if (mode === "time") return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (mode === "date") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DatePicker({ value, onChange, mode = "datetime", title = "选择时间", triggerClassName, min, buttonLabel }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value);

  const years = useMemo(() => {
    const base = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = base; y <= base + 5; y++) arr.push(y);
    return arr;
  }, []);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = useMemo(() => {
    const last = new Date(draft.getFullYear(), draft.getMonth() + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [draft]);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  function setPart(p: "y" | "M" | "d" | "h" | "m", v: number) {
    const next = new Date(draft);
    if (p === "y") next.setFullYear(v);
    if (p === "M") next.setMonth(v - 1);
    if (p === "d") next.setDate(v);
    if (p === "h") next.setHours(v);
    if (p === "m") next.setMinutes(v);
    setDraft(next);
  }

  function commit() {
    if (min && draft < min) { setDraft(min); return; }
    onChange(draft);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setDraft(value); setOpen(true); }}
        className={cn("flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg-card px-3 text-left text-md u-press", triggerClassName)}
      >
        <span>{buttonLabel ? buttonLabel(value, mode) : fmt(value, mode)}</span>
        <Icon name="calendar" size={14} className="text-text-3" />
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" block onClick={() => setOpen(false)}>取消</Button>
            <Button block onClick={commit}>确定</Button>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-2 px-3 py-4 text-sm">
          {(mode === "datetime" || mode === "date") && (
            <>
              <Column label="年" value={draft.getFullYear()} options={years} onChange={(v) => setPart("y", v)} />
              <Column label="月" value={draft.getMonth() + 1} options={months} onChange={(v) => setPart("M", v)} />
              <Column label="日" value={draft.getDate()} options={days} onChange={(v) => setPart("d", v)} />
            </>
          )}
          {(mode === "datetime" || mode === "time") && (
            <>
              <Column label="时" value={draft.getHours()} options={hours} onChange={(v) => setPart("h", v)} />
              <Column label="分" value={draft.getMinutes()} options={minutes} onChange={(v) => setPart("m", v)} />
            </>
          )}
        </div>
      </Sheet>
    </>
  );
}

function Column({ label, value, options, onChange }: { label: string; value: number; options: number[]; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="mb-1 text-center text-xs text-text-3">{label}</p>
      <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-bg-page">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "block w-full px-2 py-1.5 text-center text-md u-press",
              o === value ? "bg-primary-soft text-primary" : "text-text"
            )}
          >
            {String(o).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2:把所有 20 个 primitives 文件加进暂存**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/components/ui/ && \
  git status
```

预期:列出 20 个 .tsx 文件,无 antd-mobile import。

- [ ] **Step 3:跑 typecheck 看 primitives 自身**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  npx tsc -p apps/web/tsconfig.json --noEmit 2>&1 | head -50
```

预期:可能有旧页面 antd-mobile 引用错误,**忽略**,看是否有 primitives 自身的红色。如有,修复后继续。

- [ ] **Step 4:Commit (Commit 1 收尾)**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/components/ui/ && \
  git commit -m "feat(ui): add 20 primitives (button, card, input, sheet, dialog, toast, tabs, tab-bar, badge, status-dot, skeleton, empty, list-row, select, switch, checkbox, radio, date-picker, icon, textarea)"
```

---

## Commit 2:Layout + 14 Patterns + Barrel + 删除旧文件

### Task 2.1:Layout — `components/layout/top-bar.tsx` + `page.tsx`

**Files:**
- Create: `apps/web/components/layout/top-bar.tsx`
- Create: `apps/web/components/layout/page.tsx`

- [ ] **Step 1:写 `top-bar.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

export function TopBar({ title, onBack, right, className }: { title: string; onBack?: () => void; right?: React.ReactNode; className?: string }) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-[54px] items-center border-b border-border bg-bg-card px-2",
        className
      )}
    >
      <button onClick={back} aria-label="返回" className="flex h-10 w-10 items-center justify-center text-text-2 u-press">
        <Icon name="chevron-left" size={20} />
      </button>
      <h1 className="flex-1 truncate text-center text-xl text-text">{title}</h1>
      <div className="flex h-10 w-10 items-center justify-center">{right}</div>
    </header>
  );
}
```

- [ ] **Step 2:写 `page.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("page-shell", className)}>{children}</main>;
}
```

---

### Task 2.2:Layout — 重写 `components/layout/bottom-nav.tsx`

**Files:**
- Modify: `apps/web/components/layout/BottomNav.tsx` (整文件重写,改 `.tsx` 扩展名 + 用新 `TabBar` primitive)

- [ ] **Step 1:写文件**

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/components/ui/tab-bar";
import { Icon } from "@/components/ui/icon";

const tabs = [
  { key: "/", label: "首页", icon: <Icon name="home" size={20} />, match: (p: string) => p === "/" },
  { key: "/tasks", label: "任务中心", icon: <Icon name="tasks" size={20} />, match: (p: string) => p?.startsWith("/tasks") },
  { key: "/mine", label: "我的", icon: <Icon name="profile" size={20} />, match: (p: string) => p?.startsWith("/mine") },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const activeKey = tabs.find((t) => t.match(pathname))?.key ?? "/";
  return (
    <TabBar
      activeKey={activeKey}
      onChange={(k) => router.push(k)}
      items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
    />
  );
}
```

- [ ] **Step 2:重命名文件**

`git mv apps/web/components/layout/BottomNav.tsx apps/web/components/layout/bottom-nav.tsx`

- [ ] **Step 3:验证 import 路径已更新**

`grep -rn "from.*BottomNav" apps/web/` 应只剩 `from "./layout/bottom-nav"`(后续 Task 2.7 barrel 处理)。

---

### Task 2.3:Pattern — `page-header.tsx` / `empty-state.tsx` / `field-label.tsx` / `message.tsx` / `token-text.tsx` / `status-badge.tsx` / `step-indicator.tsx`

**Files:**
- Create: `apps/web/components/patterns/page-header.tsx`
- Create: `apps/web/components/patterns/empty-state.tsx`
- Create: `apps/web/components/patterns/field-label.tsx`
- Create: `apps/web/components/patterns/message.tsx`
- Create: `apps/web/components/patterns/token-text.tsx`
- Create: `apps/web/components/patterns/status-badge.tsx`
- Create: `apps/web/components/patterns/step-indicator.tsx`

- [ ] **Step 1:写 `page-header.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function PageHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-3 py-4", className)}>
      <div className="min-w-0">
        <h1 className="text-4xl text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-text-2">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 2:写 `empty-state.tsx`**

```tsx
import { Empty } from "@/components/ui/empty";

export const EmptyState = Empty;
```

- [ ] **Step 3:写 `field-label.tsx`**

```tsx
export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-md font-semibold text-text">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}
```

- [ ] **Step 4:写 `message.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function Message({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  return <p className={cn("rounded-md px-3 py-2 text-sm", kind === "ok" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger")}>{children}</p>;
}
```

- [ ] **Step 5:写 `token-text.tsx`**

```tsx
export function TokenText({ tail }: { tail?: string }) {
  return <span className="font-mono tabular text-text-2">tk_****{tail || "----"}</span>;
}
```

- [ ] **Step 6:写 `status-badge.tsx`**

```tsx
import { Badge } from "@/components/ui/badge";

const labelMap: Record<string, string> = {
  normal: "正常", expired: "已失效", running: "执行中", error: "异常",
  enabled: "启用", disabled: "停用", success: "成功", failed: "失败", pending: "等待中",
  ACTIVE: "正常", INVALID: "失效", REVOKED: "撤销",
  account: "账号级", channel: "频道级",
};

export function StatusBadge({ status }: { status: string }) {
  const variant =
    ["normal", "enabled", "success", "ACTIVE"].includes(status) ? "success" :
    ["expired", "failed", "error", "INVALID", "REVOKED"].includes(status) ? "danger" :
    "warning";
  return <Badge variant={variant} text={labelMap[status] ?? status} />;
}
```

- [ ] **Step 7:写 `step-indicator.tsx`**

```tsx
import { cn } from "@/lib/cn";

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-pill text-xs font-semibold",
                done && "bg-primary text-white",
                active && "bg-primary text-white",
                !done && !active && "bg-border text-text-3"
              )}
            >
              {i + 1}
            </span>
            <span className={cn("text-sm", active || done ? "text-text" : "text-text-3")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1", i < current ? "bg-primary" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
```

---

### Task 2.4:Pattern — `stat-card.tsx` / `risk-card.tsx` / `risk-card-compact.tsx` / `token-row.tsx` / `hot-topic-item.tsx` / `model-row.tsx`

**Files:**
- Create: `apps/web/components/patterns/stat-card.tsx`
- Create: `apps/web/components/patterns/risk-card.tsx`
- Create: `apps/web/components/patterns/risk-card-compact.tsx`
- Create: `apps/web/components/patterns/token-row.tsx`
- Create: `apps/web/components/patterns/hot-topic-item.tsx`
- Create: `apps/web/components/patterns/model-row.tsx`

- [ ] **Step 1:写 `stat-card.tsx`**

```tsx
import { Card } from "@/components/ui/card";
import { StatusDot, type StatusDotStatus } from "@/components/ui/status-dot";

export function StatCard({ label, value, hint, status }: { label: string; value: React.ReactNode; hint?: string; status?: StatusDotStatus }) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-text-2">
        {status && <StatusDot status={status} size="sm" />}
        <span>{label}</span>
      </div>
      <div className="text-4xl tabular text-text">{value}</div>
      {hint && <div className="text-xs text-text-3">{hint}</div>}
    </Card>
  );
}
```

注意:这要求 `status-dot.tsx` 导出 `StatusDotStatus` 类型。回 Task 1.19 Step 3,在 `export function StatusDot` 上方加 `export type StatusDotStatus = Status;` 并改 `status: StatusDotStatus` 参数类型。

- [ ] **Step 2:写 `risk-card.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

const colorByLevel = { high: "bg-danger", mid: "bg-warning", low: "bg-primary" } as const;

export function RiskCard({ level, title, description, meta }: { level: "high" | "mid" | "low"; title: string; description: string; meta?: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden p-0">
      <span className={cn("absolute inset-y-0 left-0 w-1", colorByLevel[level])} aria-hidden />
      <div className="p-4 pl-5">
        <h4 className="text-md text-text">{title}</h4>
        <p className="mt-1 line-clamp-2 text-sm text-text-2">{description}</p>
        {meta && <div className="mt-2 text-xs text-text-3">{meta}</div>}
      </div>
    </Card>
  );
}
```

- [ ] **Step 3:写 `risk-card-compact.tsx`**

```tsx
import { Card } from "@/components/ui/card";
import { StatusDot, type StatusDotStatus } from "@/components/ui/status-dot";

const statusByLevel: Record<"high" | "mid" | "low", StatusDotStatus> = { high: "danger", mid: "warning", low: "primary" };

export function RiskCardCompact({ level, title, meta }: { level: "high" | "mid" | "low"; title: string; meta?: React.ReactNode }) {
  return (
    <Card padding="sm" className="relative">
      <StatusDot status={statusByLevel[level]} className="absolute right-3 top-3" />
      <h4 className="pr-6 text-md text-text">{title}</h4>
      {meta && <div className="mt-1 text-xs text-text-3">{meta}</div>}
    </Card>
  );
}
```

- [ ] **Step 4:写 `token-row.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TokenRow({ name, token, status, onAction, actionLabel = "操作" }: { name: string; token: string; status?: { variant: "success" | "warning" | "danger" | "neutral"; text: string }; onAction?: () => void; actionLabel?: string }) {
  return (
    <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-border bg-bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-md text-text">
          <span className="truncate">{name}</span>
          {status && <Badge variant={status.variant} text={status.text} />}
        </div>
        <div className={cn("mt-1 truncate font-mono text-xs text-text-3")}>{token}</div>
      </div>
      {onAction && <Button size="sm" variant="ghost" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
```

- [ ] **Step 5:写 `hot-topic-item.tsx`**

```tsx
import { ListRow } from "@/components/ui/list-row";

export function HotTopicItem({ emoji, title, meta, onClick }: { emoji: string; title: string; meta: string; onClick?: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      prefix={<span className="text-base">{emoji}</span>}
      title={<span className="line-clamp-1">{title}</span>}
      description={meta}
    />
  );
}
```

- [ ] **Step 6:写 `model-row.tsx`**

```tsx
import { ListRow } from "@/components/ui/list-row";
import { Badge } from "@/components/ui/badge";

export function ModelRow({ name, provider, status, onClick }: { name: string; provider: string; status: "enabled" | "disabled"; onClick?: () => void }) {
  return (
    <ListRow
      onClick={onClick}
      title={name}
      description={provider}
      suffix={
        <Badge
          variant={status === "enabled" ? "success" : "neutral"}
          text={status === "enabled" ? "启用" : "停用"}
        />
      }
    />
  );
}
```

---

### Task 2.5:Pattern — `account-card.tsx` / `channel-card.tsx` / `task-template-card.tsx` / `scheduled-task-card.tsx` / `execution-record-card.tsx`

**Files:**
- Create: `apps/web/components/patterns/account-card.tsx`
- Create: `apps/web/components/patterns/channel-card.tsx`
- Create: `apps/web/components/patterns/task-template-card.tsx`
- Create: `apps/web/components/patterns/scheduled-task-card.tsx`
- Create: `apps/web/components/patterns/execution-record-card.tsx`

- [ ] **Step 1:写 `account-card.tsx`**

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { TokenText } from "./token-text";
import type { Account } from "@/lib/domain";

export function AccountCard({ account, onDelete }: { account: Account; onDelete?: () => void }) {
  return (
    <Card className="space-y-3">
      <Link href={`/accounts/${account.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-3">QQ：{account.qq}</p>
            <h2 className="mt-1 truncate text-2xl text-text">{account.nickname || "未命名账号"}</h2>
          </div>
          <StatusBadge status={account.status} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Info label="Token" value={<TokenText tail={account.tokenTail} />} />
          <Info label="频道" value={`${account.channelCount ?? 0}`} />
          <Info label="未完成任务" value={`${account.pendingTaskCount ?? 0}`} />
          <Info label="最近运行" value={account.lastRunAt ? shortDate(account.lastRunAt) : "暂无"} />
        </dl>
      </Link>
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
        <Link href={`/accounts/${account.id}`}><Button block size="sm" variant="secondary">详情</Button></Link>
        <Link href={`/accounts/${account.id}/edit`}><Button block size="sm" variant="secondary">编辑</Button></Link>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-danger">删除</Button>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-bg-page px-3 py-2">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="mt-0.5 truncate font-medium text-text">{value}</dd>
    </div>
  );
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
```

- [ ] **Step 2:写 `channel-card.tsx`**

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { Channel } from "@/lib/domain";

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link href={`/accounts/${channel.accountId}/channels/${channel.id}`} className="block">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-2xl text-text">{channel.name}</h3>
            <p className="mt-1 text-xs text-text-3">ID：{channel.channelId}</p>
          </div>
          <span className="flex items-center gap-1 text-sm text-text-3">
            进入 <Icon name="chevron-right" size={12} />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Info label="状态" value="正常" />
          <Info label="板块" value={`${channel.sectionCount ?? 0}`} />
          <Info label="任务" value={`${channel.scheduledTaskCount ?? 0}`} />
        </div>
      </Card>
    </Link>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-bg-page px-3 py-2">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="mt-0.5 font-medium text-text">{value}</dd>
    </div>
  );
}
```

- [ ] **Step 3:写 `task-template-card.tsx`**

```tsx
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { TaskTemplate } from "@/lib/domain";

export function TaskTemplateCard({ template, selected, onClick }: { template: TaskTemplate; selected?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left u-press">
      <Card className={cn("transition-colors", selected && "border-primary bg-primary-soft")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg text-text">{template.name}</h3>
            <p className="mt-1 text-sm text-text-2">{template.description}</p>
          </div>
          <StatusBadge status={template.targetLevel} />
        </div>
      </Card>
    </button>
  );
}
```

- [ ] **Step 4:写 `scheduled-task-card.tsx`**

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { ScheduledTask } from "@/lib/domain";

export function ScheduledTaskCard({ task }: { task: ScheduledTask }) {
  return (
    <Link href={`/tasks/schedules/${task.id}`} className="block">
      <Card className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-2xl text-text">{task.name || task.taskType}</h3>
          <p className="mt-1 text-sm text-text-2">{task.targetLevel === "account" ? "账号级任务" : "频道级任务"} · {task.nextRunAt || "立即"}</p>
        </div>
        <StatusBadge status={task.status} />
      </Card>
    </Link>
  );
}
```

- [ ] **Step 5:写 `execution-record-card.tsx`**

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import type { ExecutionRecord } from "@/lib/domain";

export function ExecutionRecordCard({ record }: { record: ExecutionRecord }) {
  return (
    <Link href={`/tasks/records/${record.id}`} className="block">
      <Card className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl text-text">{record.taskName || record.taskType}</h3>
          <StatusBadge status={record.status} />
        </div>
        <p className="text-sm text-text-2">
          {record.accountSnapshot.nickname || record.accountSnapshot.qq} · {record.channelSnapshot?.name || "全账号"}
        </p>
        <p className="text-xs text-text-3">{record.startedAt ? shortDate(record.startedAt) : "暂无时间"}</p>
      </Card>
    </Link>
  );
}

function shortDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
```

---

### Task 2.6:改写 `app/(tabs)/layout.tsx`

**Files:**
- Modify: `apps/web/app/(tabs)/layout.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
import { BottomNav } from "@/components/layout/bottom-nav";
import { ToastHost } from "@/components/ui/toast";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-shell">{children}</div>
      <BottomNav />
      <ToastHost />
    </>
  );
}
```

---

### Task 2.7:重写 `components/business/mobile.tsx` 为 barrel re-export

**Files:**
- Modify: `apps/web/components/business/Mobile.tsx` (整文件重写,改小写文件名)
- 删除: `apps/web/components/ui/Segmented.tsx`、`components/ui/ThemeToggle.tsx`、`components/patterns/NumberTicker.tsx`、`lib/theme.ts`

- [ ] **Step 1:`git mv` 重命名文件**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git mv apps/web/components/business/Mobile.tsx apps/web/components/business/mobile.tsx
```

- [ ] **Step 2:替换 mobile.tsx 内容**

```tsx
// Pure barrel re-export so existing imports from "@/components/business/Mobile" keep working.
export { PageHeader } from "@/components/patterns/page-header";
export { EmptyState as EmptyPanel } from "@/components/patterns/empty-state";
export { FieldLabel } from "@/components/patterns/field-label";
export { Message } from "@/components/patterns/message";
export { TokenText } from "@/components/patterns/token-text";
export { StatusBadge as StatusTag } from "@/components/patterns/status-badge";
export { AccountCard } from "@/components/patterns/account-card";
export { ChannelCard } from "@/components/patterns/channel-card";
export { TaskTemplateCard } from "@/components/patterns/task-template-card";
export { ScheduledTaskCard } from "@/components/patterns/scheduled-task-card";
export { ExecutionRecordCard } from "@/components/patterns/execution-record-card";
export { StatCard } from "@/components/patterns/stat-card";
export { RiskCard } from "@/components/patterns/risk-card";
export { RiskCardCompact } from "@/components/patterns/risk-card-compact";
export { TokenRow } from "@/components/patterns/token-row";
export { HotTopicItem } from "@/components/patterns/hot-topic-item";
export { ModelRow } from "@/components/patterns/model-row";
export { StepIndicator } from "@/components/patterns/step-indicator";
```

- [ ] **Step 3:删除 obsolete 文件**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git rm apps/web/components/patterns/NumberTicker.tsx \
         apps/web/components/ui/ThemeToggle.tsx \
         apps/web/components/ui/Segmented.tsx \
         apps/web/lib/theme.ts
```

- [ ] **Step 4:更新所有残留 import (`Mobile` → `mobile`)**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  grep -rln "@/components/business/Mobile" apps/web
```

预期:返回若干 page 文件。在下一步 Task 2.8 改写页面时统一更新 import 路径(本任务不需手动逐文件改)。

- [ ] **Step 5:Commit (Commit 2 收尾)**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/components/ apps/web/app/\(tabs\)/layout.tsx && \
  git status
```

预期:显示新增的 14 个 pattern、layout/top-bar、layout/page、layout/bottom-nav、business/mobile,(tabs)/layout.tsx;删除 4 个旧文件;**不要**包含任何 page.tsx(那些在 Commit 3)。

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git commit -m "feat(ui): rewrite patterns (14 business cards) + layout shell + delete legacy files"
```

---

## Commit 3:页面迁移 + 验证

### Task 3.1:首页 — `app/(tabs)/page.tsx`

**Files:**
- Modify: `apps/web/app/(tabs)/page.tsx` (整文件重写)

- [ ] **Step 1:读现有 home/page.tsx 删除后留下的期望行为**

`home/page.tsx` 已删(空目录),`page.tsx` 是新的首页。读 `git log -p 0a54782^..0a54782 apps/web/app/login/page.tsx` 或历史 commit 拼装当前期望,简化为:PageHeader "首页" + StatCard ×3 (活跃账号 / 频道 / 任务) + 快捷入口按钮(新增账号 / 新建任务)+ 最近账号列表(AccountCard × N)。

- [ ] **Step 2:写文件**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/patterns/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { AccountCard } from "@/components/patterns/account-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { accountService, type Account } from "@/lib/domain";

export default function HomePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    accountService.getAccountList()
      .then(setAccounts)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = accounts.filter((a) => a.status === "normal").length;
  const channelCount = accounts.reduce((sum, a) => sum + (a.channelCount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="运营工作台"
        subtitle="AI 辅助的频道运营"
        action={<Link href="/accounts/new"><Button size="sm" variant="ghost">＋ 账号</Button></Link>}
      />

      <section className="grid grid-cols-3 gap-3">
        <StatCard label="活跃账号" value={activeCount} status="success" />
        <StatCard label="频道" value={channelCount} status="primary" />
        <StatCard label="任务" value={accounts.reduce((s, a) => s + (a.pendingTaskCount ?? 0), 0)} status="warning" />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg text-text">最近账号</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton height={120} className="block" />
            <Skeleton height={120} className="block" />
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="暂无账号"
            hint="绑定 Token 后开始管理频道"
            action={<Link href="/accounts/new"><Button>＋ 新增账号</Button></Link>}
          />
        ) : (
          <ul className="space-y-3">
            {accounts.map((a) => <li key={a.id}><AccountCard account={a} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
```

- [ ] **Step 3:typecheck 该文件**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  npx tsc -p apps/web/tsconfig.json --noEmit 2>&1 | grep -E "\(tabs\)/page\.tsx" | head -20
```

预期:0 命中(仅本文件无错误)。其它页面错误忽略,后续 Task 处理。

---

### Task 3.2:任务中心 — `app/(tabs)/tasks/page.tsx`

**Files:**
- Modify: `apps/web/app/(tabs)/tasks/page.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Toast } from "@/components/ui/toast";
import { PageHeader } from "@/components/patterns/page-header";
import { EmptyState } from "@/components/patterns/empty-state";
import { TaskTemplateCard, ScheduledTaskCard, ExecutionRecordCard } from "@/components/patterns";
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
```

- [ ] **Step 2:补 `components/patterns/index.ts` barrel**

创建 `apps/web/components/patterns/index.ts` 导出 14 个 pattern(为 Task 3.2 的 `@/components/patterns` import 服务):

```ts
export { PageHeader } from "./page-header";
export { EmptyState } from "./empty-state";
export { FieldLabel } from "./field-label";
export { Message } from "./message";
export { TokenText } from "./token-text";
export { StatusBadge } from "./status-badge";
export { StatCard } from "./stat-card";
export { RiskCard } from "./risk-card";
export { RiskCardCompact } from "./risk-card-compact";
export { TokenRow } from "./token-row";
export { HotTopicItem } from "./hot-topic-item";
export { ModelRow } from "./model-row";
export { AccountCard } from "./account-card";
export { ChannelCard } from "./channel-card";
export { TaskTemplateCard } from "./task-template-card";
export { ScheduledTaskCard } from "./scheduled-task-card";
export { ExecutionRecordCard } from "./execution-record-card";
export { StepIndicator } from "./step-indicator";
```

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && git add apps/web/components/patterns/index.ts
```

(暂不 commit,合并到 Commit 3 收尾)

---

### Task 3.3:我的 — `app/(tabs)/mine/page.tsx`

**Files:**
- Modify: `apps/web/app/(tabs)/mine/page.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
"use client";

import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/patterns/page-header";
import { useState } from "react";

export default function MinePage() {
  const [confirmClear, setConfirmClear] = useState(false);

  function clearCache() {
    localStorage.removeItem("tcm_disabled_task_ids");
    setConfirmClear(false);
    Toast.show({ content: "缓存已清理", type: "success" });
  }

  return (
    <>
      <PageHeader title="我的" />

      <Card padding="md" className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-soft text-primary">
          <Icon name="profile" size={24} />
        </span>
        <div>
          <h2 className="text-xl text-text">运营用户</h2>
          <p className="text-sm text-text-3">登录后查看更多信息</p>
        </div>
      </Card>

      <section className="mt-4 overflow-hidden rounded-lg border border-border bg-bg-card">
        <ListRow title="使用说明" onClick={() => Toast.show({ content: "使用说明待接入" })} />
        <ListRow title="Token 获取说明" onClick={() => Toast.show({ content: "Token 获取说明待接入" })} />
        <ListRow title="系统设置" onClick={() => Toast.show({ content: "系统设置待接入" })} />
        <ListRow title="清理缓存" onClick={() => setConfirmClear(true)} />
        <ListRow title="关于项目" onClick={() => Toast.show({ content: "关于项目待接入" })} />
      </section>

      <Dialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="清理本地缓存"
        content="将清除本地禁用任务配置,确认继续？"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmClear(false)}>取消</Button>
            <Button block onClick={clearCache}>确认</Button>
          </>
        }
      />
    </>
  );
}
```

---

### Task 3.4:accounts/new — `app/accounts/new/page.tsx`

**Files:**
- Modify: `apps/web/app/accounts/new/page.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { FieldLabel } from "@/components/patterns/field-label";
import { accountService } from "@/lib/domain";

export default function NewAccountPage() {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);
  const canSave = useMemo(() => qq.trim() && token.trim(), [qq, token]);

  async function save() {
    if (!canSave) { Toast.show({ content: "请填写 QQ号 和 Token", type: "error" }); return; }
    setBusy(true);
    try {
      await accountService.createAccount({ qq, token, nickname, remark });
      Toast.show({ content: "账号已保存", type: "success" });
      router.replace("/");
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="新增账号" />
      <main className="page-shell space-y-4">
        <section>
          <FieldLabel required>QQ号</FieldLabel>
          <Input value={qq} onChange={(e) => setQq(e.target.value)} placeholder="请输入 QQ号" />
        </section>
        <section>
          <FieldLabel required>Token</FieldLabel>
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="请输入 Token" rows={4} />
        </section>
        <section>
          <FieldLabel>昵称</FieldLabel>
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="方便识别账号,可不填" />
        </section>
        <section>
          <FieldLabel>备注</FieldLabel>
          <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="自定义备注,可不填" rows={3} />
        </section>
        <Button block size="lg" loading={busy} disabled={!canSave} onClick={save}>保存账号</Button>
      </main>
    </>
  );
}
```

---

### Task 3.5:accounts/[id] — 详情页

**Files:**
- Modify: `apps/web/app/accounts/[accountId]/page.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { TopBar } from "@/components/layout/top-bar";
import { StatusBadge } from "@/components/patterns/status-badge";
import { TokenText } from "@/components/patterns/token-text";
import { ChannelCard } from "@/components/patterns/channel-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { accountService, channelService, type Account, type Channel } from "@/lib/domain";

export default function AccountDetailPage({ params }: { params: { accountId: string } }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [a, cs] = await Promise.all([
        accountService.getAccountDetail(params.accountId),
        channelService.getChannelsByAccount(params.accountId),
      ]);
      setAccount(a);
      setChannels(cs);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [params.accountId]);

  useEffect(() => { refresh(); }, [refresh]);

  async function syncChannels() {
    setBusy(true);
    try {
      const res = await channelService.refreshChannels(params.accountId);
      Toast.show({ content: `已刷新 ${res.count} 个频道`, type: "success" });
      await refresh();
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setConfirmDelete(false);
    try {
      await accountService.deleteAccount(params.accountId);
      Toast.show({ content: "账号已删除", type: "success" });
      window.location.href = "/";
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    }
  }

  return (
    <>
      <TopBar
        title="账号详情"
        right={
          account && (
            <Link href={`/accounts/${params.accountId}/edit`} className="text-md text-text-2">编辑</Link>
          )
        }
      />
      <main className="page-shell space-y-4">
        {loading ? (
          <Skeleton height={120} className="block" />
        ) : !account ? (
          <EmptyState title="账号不存在" hint="可能已被删除" />
        ) : (
          <>
            <section className="rounded-lg border border-border bg-bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-text-3">QQ：{account.qq}</p>
                  <h2 className="mt-1 text-2xl text-text">{account.nickname || "未命名账号"}</h2>
                </div>
                <StatusBadge status={account.status} />
              </div>
              <div className="mt-3 space-y-1 text-sm text-text-2">
                <p>Token：<TokenText tail={account.tokenTail} /></p>
                <p>最近运行：{account.lastRunAt || "暂无"}</p>
                {account.remark && <p>备注：{account.remark}</p>}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg text-text">频道列表</h3>
                <Button size="sm" variant="ghost" loading={busy} onClick={syncChannels}>刷新频道</Button>
              </div>
              {channels.length === 0 ? (
                <EmptyState title="暂无频道" hint="请刷新频道或检查 Token 状态" action={<Button onClick={syncChannels}>刷新频道</Button>} />
              ) : (
                <ul className="space-y-3">{channels.map((c) => <li key={c.id}><ChannelCard channel={c} /></li>)}</ul>
              )}
            </section>

            <section className="pt-6">
              <Button block variant="ghost" className="text-danger" onClick={() => setConfirmDelete(true)}>删除账号</Button>
            </section>
          </>
        )}
      </main>

      <Dialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="删除账号"
        content="账号及其所有关联数据将被清除,且不可恢复。"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmDelete(false)}>取消</Button>
            <Button block variant="danger" onClick={onDelete}>确认删除</Button>
          </>
        }
      />
    </>
  );
}
```

- [ ] **Step 2:验证 `accountService.deleteAccount` 存在**

`grep -n "deleteAccount" apps/web/lib/domain.ts` — 如缺,在 `domain.ts` 末尾补一个 stub:`async deleteAccount(id: string) { return api.delete(\`/accounts/\${id}\`); }`(对齐现有 `api.ts` 模式)。

---

### Task 3.6:accounts/[id]/edit + accounts/[id]/channels/[channelId]

**Files:**
- Modify: `apps/web/app/accounts/[accountId]/edit/page.tsx`
- Create: `apps/web/app/accounts/[accountId]/channels/[channelId]/page.tsx` (如缺)

- [ ] **Step 1:改写 edit 页 — 复用 new 页结构**

参照 Task 3.4,把 `useState` 初值改为从 `accountService.getAccountDetail` 拉取,提交时调 `accountService.updateAccount`。代码框架同 3.4,变量名一致。

- [ ] **Step 2:写 channels/[channelId]/page.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { TokenRow } from "@/components/patterns/token-row";
import { StatusBadge } from "@/components/patterns/status-badge";
import { EmptyState } from "@/components/patterns/empty-state";
import { accountService, channelService, type Account, type Channel, type Section } from "@/lib/domain";

export default function ChannelDetailPage() {
  const params = useParams<{ accountId: string; channelId: string }>();
  const [account, setAccount] = useState<Account | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      accountService.getAccountDetail(params.accountId),
      channelService.getChannelDetail(params.accountId, params.channelId),
      channelService.getSectionsByChannel(params.accountId, params.channelId),
    ])
      .then(([a, c, s]) => { setAccount(a); setChannel(c); setSections(s); })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.accountId, params.channelId]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!channel) return <TopBar title="频道详情" />;

  return (
    <>
      <TopBar title={channel.name} />
      <main className="page-shell space-y-4">
        <section className="rounded-lg border border-border bg-bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{channel.name}</h2>
              <p className="mt-1 text-xs text-text-3">ID：{channel.channelId}</p>
              {account && <p className="mt-1 text-sm text-text-2">账号：{account.nickname || account.qq}</p>}
            </div>
            <StatusBadge status="normal" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg text-text">板块</h3>
          {sections.length === 0 ? <EmptyState title="暂无板块" /> : (
            <ul className="overflow-hidden rounded-lg border border-border bg-bg-card">
              {sections.map((s) => (
                <li key={s.id} className="border-b border-border px-4 py-3 last:border-0">
                  <p className="text-md text-text">{s.name}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <TokenRow
          name="频道 Token"
          token={`tk_****${channel.tokenTail ?? "----"}`}
          status={{ variant: "success", text: "有效" }}
        />
      </main>
    </>
  );
}
```

- [ ] **Step 3:补 domain.ts 缺失函数**

`channelService.getChannelDetail(accountId, channelId)` — 如缺,补 `api.get(\`/accounts/\${accountId}/channels/\${channelId}\`)`。

---

### Task 3.7:tasks/new — 4 步向导 (最复杂)

**Files:**
- Modify: `apps/web/app/tasks/new/page.tsx` (整文件重写)

- [ ] **Step 1:写文件**

```tsx
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
import { StepIndicator } from "@/components/patterns/step-indicator";
import { TaskTemplateCard } from "@/components/patterns/task-template-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { FieldLabel } from "@/components/patterns/field-label";
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
            <p>执行范围：{isChannelTask ? (rangeType === "all" ? "全频道" : `指定板块：${sectionIds.length} 个`) : "全账号"}</p>
            <p>执行方式：{executionMode === "immediate" ? "立即执行" : scheduleType === "daily" ? `每天 ${formatTime(scheduleAt)}` : formatDateTime(scheduleAt)}</p>
          </Card>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border bg-bg-card p-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
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
```

---

### Task 3.8:tasks/schedules/[id] + schedules/[id]/edit + records/[id]

**Files:**
- Modify: `apps/web/app/tasks/schedules/[id]/page.tsx`
- Modify: `apps/web/app/tasks/schedules/[id]/edit/page.tsx`
- Modify: `apps/web/app/tasks/records/[id]/page.tsx`

- [ ] **Step 1:写 schedules/[id]/page.tsx — 任务详情**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { StatusBadge } from "@/components/patterns/status-badge";
import { taskService, type ScheduledTask } from "@/lib/domain";

export default function ScheduleDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<ScheduledTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskService.getScheduledTask(params.id)
      .then(setTask)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!task) return <TopBar title="任务详情" />;

  return (
    <>
      <TopBar title={task.name || task.taskType} />
      <main className="page-shell space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{task.name || task.taskType}</h2>
              <p className="mt-1 text-sm text-text-2">{task.targetLevel === "account" ? "账号级" : "频道级"} · 下次运行 {task.nextRunAt || "立即"}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>
        </Card>
        <section className="overflow-hidden rounded-lg border border-border bg-bg-card">
          <ListRow title="任务类型" suffix={task.taskType} />
          <ListRow title="执行账号" suffix={task.accountNickname || "—"} />
          <ListRow title="执行频道" suffix={task.channelName || "全账号"} />
          <ListRow title="创建时间" suffix={task.createdAt} />
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2:写 schedules/[id]/edit/page.tsx — 复用 new 框架**

镜像 `tasks/new/page.tsx` 步骤 2/3 的"对象 + 配置"区,但 `taskType/accountId/channelId` 等初值从 `taskService.getScheduledTask` 拉取,提交时调 `taskService.updateScheduledTask`。

- [ ] **Step 3:写 records/[id]/page.tsx — 执行记录详情**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { StatusBadge } from "@/components/patterns/status-badge";
import { executionService, type ExecutionRecord } from "@/lib/domain";

export default function ExecutionRecordPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    executionService.getExecutionRecord(params.id)
      .then(setRecord)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <main className="page-shell"><Skeleton height={300} className="block" /></main>;
  if (!record) return <TopBar title="执行记录" />;

  return (
    <>
      <TopBar title={record.taskName || record.taskType} />
      <main className="page-shell space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl text-text">{record.taskName || record.taskType}</h2>
              <p className="mt-1 text-sm text-text-2">{record.accountSnapshot.nickname || record.accountSnapshot.qq} · {record.channelSnapshot?.name || "全账号"}</p>
              <p className="mt-1 text-xs text-text-3">{record.startedAt || "暂无时间"}</p>
            </div>
            <StatusBadge status={record.status} />
          </div>
        </Card>
        <section className="overflow-hidden rounded-lg border border-border bg-bg-card">
          <ListRow title="状态" suffix={record.status} />
          <ListRow title="开始时间" suffix={record.startedAt || "—"} />
          <ListRow title="结束时间" suffix={record.endedAt || "—"} />
          <ListRow title="耗时" suffix={record.duration || "—"} />
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 4:补 domain.ts 缺失函数**

`taskService.getScheduledTask(id)`、`executionService.getExecutionRecord(id)`、`taskService.updateScheduledTask(...)` — 如缺,补齐(参照 `api.ts` 模式)。

---

### Task 3.9:Commit 3 收尾

**Files:** 所有改写的 page + 新增的 patterns/index.ts

- [ ] **Step 1:跑 typecheck + lint + build**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  npm -w apps/web run typecheck && \
  npm -w apps/web run lint && \
  npm -w apps/web run build
```

预期:全部 0 error。如有错误,逐个修复。

- [ ] **Step 2:跑 5.4 节 grep 收尾清单**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  echo "== antd-mobile ==" && \
  grep -r "antd-mobile" apps/web 2>&1 | head -5 && \
  echo "== Inter/JetBrains ==" && \
  grep -rE "Inter|JetBrains" apps/web/app apps/web/components apps/web/tailwind.config.ts apps/web/lib 2>&1 | head -5 && \
  echo "== old tokens ==" && \
  grep -rE "ink-[0-9]|paper-[0-9]|line-strong|paper-sunken|lime-ink|accent-soft|risk-(high|mid|low)" apps/web/app apps/web/components 2>&1 | head -5 && \
  echo "== NumberTicker ==" && \
  grep -r "NumberTicker" apps/web 2>&1 | head -5 && \
  echo "== obsolete animations ==" && \
  grep -rE "stagger|page-enter|shimmer|pulseEdge|theme-switching" apps/web/app apps/web/components apps/web/lib apps/web/tailwind.config.ts 2>&1 | head -5
```

预期:每段 `echo` 后面**无任何输出**。如有命中,定位到文件修复。

- [ ] **Step 3:启动 dev server 5 秒**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  NEXT_PUBLIC_USE_MOCK=1 npm -w apps/web run dev & sleep 5 && kill %1 2>/dev/null
```

预期:启动无报错,看到 `Ready in` 字样。

- [ ] **Step 4:Commit**

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git add apps/web/app apps/web/components/patterns/index.ts && \
  git status
```

预期:列出的文件全部属于本计划列出的 10 个 page + patterns/index.ts,**没有**误改其它文件。

```bash
cd "D:/Personal/ai-future-studio/tencent-channel-manage" && \
  git commit -m "feat(ui): migrate all 10 pages to new primitives (quantora style)"
```

---

## 风险与回滚

- 每个 commit 单独可回滚 — 若 Commit 3 引入问题,`git revert HEAD` 即可回到 14 个 pattern + 旧 antd-mobile 状态。
- `lib/cn.ts` 是 Commit 1 唯一新增的工具 import;若与旧 `lib/utils.ts` 命名冲突,只用 `@/lib/cn` 不再 `@/lib/utils` 的 `cn`。
- `DeleteAccount` / `getChannelDetail` / `getScheduledTask` 等 domain 函数若不存在,本计划已在对应 Task 注明在 `lib/domain.ts` 末尾补齐,**不会**改动既有函数签名。

---

## 验证总览(End-to-End)

| 命令 | 通过标准 |
|---|---|
| `npm -w apps/web run typecheck` | 0 error |
| `npm -w apps/web run lint` | 0 error |
| `npm -w apps/web run build` | 编译通过,无 hydration warning |
| `grep -r "antd-mobile" apps/web` | 0 命中 |
| `grep -rE "Inter|JetBrains" apps/web/{app,components,lib} apps/web/tailwind.config.ts` | 0 命中 |
| `grep -rE "ink-[0-9]|paper-[0-9]|lime-ink|accent-soft|risk-(high\|mid\|low)" apps/web/{app,components}` | 0 命中 |
| `grep -r "NumberTicker" apps/web` | 0 命中 |
| `grep -rE "stagger\|page-enter\|shimmer\|pulseEdge\|theme-switching" apps/web/{app,components,lib}` | 0 命中 |
| `NEXT_PUBLIC_USE_MOCK=1 npm -w apps/web run dev` | 启动 < 5s |

---

## Self-Review(已检查)

1. **Spec coverage:**
   - §1.1 颜色 token → Task 1.1 (tailwind) + 1.2 (globals.css)
   - §1.5/1.6 字体 → Task 1.1 (fontFamily) + 1.3 (layout 移除 next/font)
   - §2.1-2.3 16 个 primitives → Task 1.6-1.20 (扩到 20,涵盖 spec 未列出但页面需要的 Switch/Checkbox/Radio/DatePicker)
   - §2.4 Layout → Task 2.1-2.2
   - §2.5 4 keyframes → Task 1.2
   - §3 9 patterns → Task 2.3-2.5 (扩到 14,涵盖 spec 未列出但 Mobile.tsx 导出的 Account/Channel/Task/Execution Card)
   - §3.8 删除清单 → Task 2.7
   - §4.1 入口布局 → Task 1.2-1.3 + 2.6
   - §4.3-4.5 10 个页面 → Task 3.1-3.8
   - §4.6 business barrel → Task 2.7
   - §5.4 grep 收尾 → Task 3.9 Step 2

2. **Placeholder scan:** 无 "TBD" / "TODO" / "稍后实现"。

3. **Type consistency:** `Account`/`Channel`/`ScheduledTask`/`ExecutionRecord`/`TaskTemplate`/`Section`/`RangeType` 全部从 `@/lib/domain` 导入,与现有 page 保持一致。`EmptyState` 与 `EmptyPanel` 通过 barrel 别名互通,旧 import 路径 (`@/components/business/Mobile` 导出的 `EmptyPanel`) 仍可用。

4. **Amiguity check:** `Select` 在 `Select.tsx` 中以字符串泛型 `<T extends string>` 定义,Task 3.7 中用 `<Select value={executionMode} onChange={...} options={...}>` 调用,T 由 `value` 推断;`Radio` 同样通过 `useId` 隐藏原生 input,`Radio.Group` API 由 `Radio` 组件构成 prop 模式实现。

5. **Spec 范围外:** 移除 `app/login`、`app/(tabs)/home`、`app/(tabs)/profile`、`app/(tabs)/results` 已在工作区发生,本计划不再创建这些页面,与 spec 10 页范围对齐。
