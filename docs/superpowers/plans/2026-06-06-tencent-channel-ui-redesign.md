# Tencent Channel Manage UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `apps/web` (Next.js mobile H5) into a premium editorial + dark-tech UI: ink + acid lime palette, dual theme (system/light/dark), restrained motion, 8 UI primitives + 8 business components, all 5 pages + BottomNav redesigned.

**Architecture:** Token-first design system in CSS variables + Tailwind config. Self-hosted `next/font` (Inter + JetBrains Mono). Layered components (UI primitives → business patterns → pages). Theme via `class="dark"` on `<html>` with FOUC-prevention inline script. No animation libraries — CSS transitions + IntersectionObserver only.

**Tech Stack:**
- Next.js 14 App Router, React 18, TypeScript 5
- Tailwind CSS 3.4 (token extension, no plugin changes)
- `next/font/google` for Inter + JetBrains Mono
- CSS variables for theming
- No new npm dependencies

**Spec reference:** `docs/superpowers/specs/2026-06-06-tencent-channel-ui-redesign-design.md`

**Verification gates** (run after each task):
- `npm -w apps/web run typecheck` — must pass with 0 errors
- `npm -w apps/web run lint` — must pass with 0 errors
- `npm -w apps/web run build` — must compile (run after page tasks and final)

**Visual verification** (run after final task only): see Task 19 checklist.

---

## File Structure

```
apps/web/
  app/
    globals.css                 [REWRITE]   tokens, fonts, animations, reduced-motion
    layout.tsx                  [REWRITE]   next/font setup, FOUC script, html.dark wiring
    (tabs)/
      layout.tsx                [REWRITE]   page-enter wrapper
      home/page.tsx             [REWRITE]   editorial dashboard
      tasks/page.tsx            [REWRITE]   ①②③④ decision flow
      results/page.tsx          [REWRITE]   segmented + risk cards
      profile/page.tsx          [REWRITE]   account / token / model sections
    login/
      page.tsx                  [REWRITE]   wordmark hero
  components/
    ui/                         [CREATE DIR]
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
    layout/                     [CREATE DIR]
      BottomNav.tsx             [REWRITE]
    patterns/                   [CREATE DIR]
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
    api.ts                      [UNCHANGED]
    theme.ts                    [CREATE]
    utils.ts                    [CREATE]   cn(), formatRelativeTime()
  tailwind.config.ts            [REWRITE]
```

---

## Task 1: Foundation — Tailwind tokens, global CSS, layout, theme lib, utils

**Files:**
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Create: `apps/web/lib/theme.ts`
- Create: `apps/web/lib/utils.ts`

This is the largest single task. It establishes the token system that every other task depends on. Verify each piece before moving on.

- [ ] **Step 1.1: Rewrite `apps/web/tailwind.config.ts`**

Replace the file contents with the new token system. Use the exact content below.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: ["class", ".dark"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
          4: "rgb(var(--ink-4) / <alpha-value>)",
          inverse: "rgb(var(--ink-inverse) / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          2: "rgb(var(--paper-2) / <alpha-value>)",
          sunken: "rgb(var(--paper-sunken) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        lime: {
          DEFAULT: "rgb(var(--lime) / <alpha-value>)",
          ink: "rgb(var(--lime-ink) / <alpha-value>)",
        },
        risk: {
          high: "#E5484D",
          mid: "#F5A524",
          low: "#30A46C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "system-ui"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-inter)", "ui-sans-serif", "PingFang SC"],
      },
      fontSize: {
        d1: ["44px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "500" }],
        d2: ["32px", { lineHeight: "1.1",  letterSpacing: "-0.03em", fontWeight: "500" }],
        d3: ["24px", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "500" }],
        h1: ["20px", { lineHeight: "1.3",  letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["17px", { lineHeight: "1.35", fontWeight: "600" }],
        h3: ["15px", { lineHeight: "1.4",  fontWeight: "600" }],
        body: ["14px", { lineHeight: "1.55" }],
        small: ["13px", { lineHeight: "1.5" }],
        mini: ["12px", { lineHeight: "1.45" }],
        micro: ["11px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sheet: "0 -8px 32px -8px rgba(0,0,0,0.18), 0 -1px 0 var(--line) inset",
        pop: "0 8px 24px -8px rgba(0,0,0,0.16), 0 0 0 1px var(--line)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 1.2: Rewrite `apps/web/app/globals.css`**

Replace the file contents with the CSS variables, base styles, and animation keyframes.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ink: 10 10 11;
  --ink-2: 58 58 61;
  --ink-3: 107 107 112;
  --ink-4: 168 168 173;
  --ink-inverse: 250 250 247;
  --paper: 250 250 247;
  --paper-2: 242 240 234;
  --paper-sunken: 236 233 224;
  --line: 229 226 218;
  --line-strong: 213 209 197;
  --lime: 212 247 106;
  --lime-ink: 26 35 5;
  color-scheme: light;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

.dark {
  --ink: 242 242 238;
  --ink-2: 181 181 176;
  --ink-3: 110 110 104;
  --ink-4: 58 58 54;
  --ink-inverse: 10 10 11;
  --paper: 10 10 11;
  --paper-2: 20 20 19;
  --paper-sunken: 5 5 5;
  --line: 31 31 29;
  --line-strong: 48 48 45;
  --lime: 212 247 106;
  --lime-ink: 26 35 5;
  color-scheme: dark;
}

html, body {
  height: 100%;
  background: rgb(var(--paper));
  color: rgb(var(--ink));
  -webkit-tap-highlight-color: transparent;
}

body {
  font-size: 14px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "palt";
}

* { box-sizing: border-box; }

button { -webkit-appearance: none; appearance: none; }

.tap {
  transition: transform 80ms var(--ease-out-quint, cubic-bezier(0.22,1,0.36,1)), opacity 80ms var(--ease-out-quint, cubic-bezier(0.22,1,0.36,1));
}
.tap:active { transform: scale(0.98); opacity: 0.85; }

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

/* List stagger entrance */
.stagger > * {
  opacity: 0;
  transform: translateY(4px);
  animation: rise 320ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) forwards;
}
.stagger > *:nth-child(1)  { animation-delay: 0ms; }
.stagger > *:nth-child(2)  { animation-delay: 30ms; }
.stagger > *:nth-child(3)  { animation-delay: 60ms; }
.stagger > *:nth-child(4)  { animation-delay: 90ms; }
.stagger > *:nth-child(5)  { animation-delay: 120ms; }
.stagger > *:nth-child(6)  { animation-delay: 150ms; }
.stagger > *:nth-child(7)  { animation-delay: 180ms; }
.stagger > *:nth-child(8)  { animation-delay: 210ms; }
.stagger > *:nth-child(n+9) { animation-delay: 240ms; }
@keyframes rise {
  to { opacity: 1; transform: none; }
}

/* Page enter */
.page-enter {
  animation: pageEnter 280ms var(--ease-out-quint, cubic-bezier(0.22,1,0.36,1)) both;
}
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: none; }
}

/* Sheet */
@keyframes sheetUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* RiskCard HIGH pulse */
@keyframes pulseEdge {
  0%, 100% { box-shadow: inset 0 0 0 1px transparent; }
  50%      { box-shadow: inset 0 0 0 1px rgb(229 72 77 / 0.4); }
}
.risk-pulse { animation: pulseEdge 1.8s ease-in-out infinite; }

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton {
  background: linear-gradient(90deg, rgb(var(--paper-2)) 0%, rgb(var(--paper-sunken)) 50%, rgb(var(--paper-2)) 100%);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.4s linear infinite;
  border-radius: 6px;
}

/* Theme switching — only active during transition */
.theme-switching,
.theme-switching *,
.theme-switching *::before,
.theme-switching *::after {
  transition: background-color 240ms var(--ease-in-out-cubic, cubic-bezier(0.65,0,0.35,1)),
              color 240ms var(--ease-in-out-cubic, cubic-bezier(0.65,0,0.35,1)),
              border-color 240ms var(--ease-in-out-cubic, cubic-bezier(0.65,0,0.35,1)) !important;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 1.3: Rewrite `apps/web/app/layout.tsx`**

Replace the file with next/font setup + FOUC script + body wrapper.

```tsx
import "./globals.css";
import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

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
};

const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('tcm_theme') || 'system';
    var d = t === 'dark' ||
            (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans">
        <div className="mx-auto min-h-screen w-full max-w-[480px] bg-paper">
          {children}
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 1.4: Create `apps/web/lib/theme.ts`**

```ts
export type ThemeMode = "system" | "light" | "dark";

const KEY = "tcm_theme";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const t = window.localStorage.getItem(KEY);
  if (t === "light" || t === "dark" || t === "system") return t;
  return "system";
}

export function applyTheme(t: ThemeMode): void {
  if (typeof document === "undefined") return;
  const dark = t === "dark" || (t === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

export function setTheme(t: ThemeMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, t);
  document.documentElement.classList.add("theme-switching");
  applyTheme(t);
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-switching");
  }, 300);
}

export function cycleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === "system" ? "light" : current === "light" ? "dark" : "system";
  setTheme(next);
  return next;
}

export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    if (getStoredTheme() === "system") onChange();
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
```

- [ ] **Step 1.5: Create `apps/web/lib/utils.ts`**

```ts
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

const RTF = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });

export function formatRelativeTime(input: Date | string, now: Date = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = d.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  if (absMs < 60_000) return RTF.format(Math.round(diffMs / 1000), "second");
  if (absMs < 3_600_000) return RTF.format(Math.round(diffMs / 60_000), "minute");
  if (absMs < 86_400_000) return RTF.format(Math.round(diffMs / 3_600_000), "hour");
  if (absMs < 30 * 86_400_000) return RTF.format(Math.round(diffMs / 86_400_000), "day");
  if (absMs < 365 * 86_400_000) return RTF.format(Math.round(diffMs / (30 * 86_400_000)), "month");
  return RTF.format(Math.round(diffMs / (365 * 86_400_000)), "year");
}

export function formatLocalDate(d: Date = new Date()): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const day = days[d.getDay()];
  const iso = d.toISOString().slice(0, 10);
  return `${day} · ${iso}`;
}
```

- [ ] **Step 1.6: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS with 0 errors

- [ ] **Step 1.7: Run lint**

Run: `npm -w apps/web run lint`
Expected: PASS with 0 errors

If any errors, fix inline (likely unused import in existing `BottomNav.tsx` since styles changed).

- [ ] **Step 1.8: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/tailwind.config.ts apps/web/app/globals.css apps/web/app/layout.tsx apps/web/lib/theme.ts apps/web/lib/utils.ts
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): design system foundation — tokens, fonts, theme, utils

Add dual-theme token system (ink + acid lime), next/font setup
(Inter + JetBrains Mono), CSS animation primitives, FOUC-prevention
script, and shared utilities (cn, formatRelativeTime, formatLocalDate).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: UI Primitives — Form (Button, Input, Textarea, Select)

**Files:**
- Create: `apps/web/components/ui/Button.tsx`
- Create: `apps/web/components/ui/Input.tsx`
- Create: `apps/web/components/ui/Textarea.tsx`
- Create: `apps/web/components/ui/Select.tsx`

- [ ] **Step 2.1: Create `apps/web/components/ui/Button.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost" | "amberGhost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "tap inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 ease-out-quint disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-lime text-lime-ink hover:bg-lime/90 active:bg-lime/85",
  secondary: "bg-paper text-ink border border-line hover:border-line-strong hover:bg-paper-2",
  ghost: "text-ink hover:bg-paper-2",
  danger: "bg-risk-high text-white hover:bg-risk-high/90",
  dangerGhost: "text-risk-high hover:bg-risk-high/10",
  amberGhost: "text-risk-mid hover:bg-risk-mid/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-small",
  md: "h-10 px-4 text-body",
  lg: "h-12 px-5 text-h3",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, iconLeft, iconRight, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="font-mono text-current">···</span>
      ) : (
        <>
          {iconLeft}
          <span>{children}</span>
          {iconRight}
        </>
      )}
    </button>
  );
});
```

- [ ] **Step 2.2: Create `apps/web/components/ui/Input.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-line bg-paper px-3.5 h-10 text-body text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    />
  );
});
```

- [ ] **Step 2.3: Create `apps/web/components/ui/Textarea.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-line bg-paper px-3.5 py-3 text-body text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50 resize-y";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    />
  );
});
```

- [ ] **Step 2.4: Create `apps/web/components/ui/Select.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full appearance-none rounded-md border border-line bg-paper pl-3.5 pr-9 h-10 text-body text-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:shadow-[inset_0_-1px_0_rgb(var(--lime))] disabled:opacity-50 bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%208%22%20fill=%22none%22%20stroke=%22currentColor%22%20stroke-width=%221.6%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22><path%20d=%22M1%201.5l5%205%205-5%22/></svg>')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(base, invalid && "border-risk-high focus:border-risk-high focus:shadow-none", className)}
      {...rest}
    >
      {children}
    </select>
  );
});
```

- [ ] **Step 2.5: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 2.6: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/ui/Button.tsx apps/web/components/ui/Input.tsx apps/web/components/ui/Textarea.tsx apps/web/components/ui/Select.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): form primitives — Button, Input, Textarea, Select

6 button variants, lime focus underline on form fields, custom
select chevron via data URI (no extra deps).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: UI Primitives — Layout (Card, Badge, Segmented)

**Files:**
- Create: `apps/web/components/ui/Card.tsx`
- Create: `apps/web/components/ui/Badge.tsx`
- Create: `apps/web/components/ui/Segmented.tsx`

- [ ] **Step 3.1: Create `apps/web/components/ui/Card.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "sunken" | "outline";
export type CardPad = "sm" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  default: "bg-paper border border-line",
  sunken: "bg-paper-2",
  outline: "bg-transparent border border-line",
};

const pads: Record<CardPad, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  pad?: CardPad;
  as?: "div" | "article" | "section";
}

export function Card({ variant = "default", pad = "md", as = "div", className, children, ...rest }: CardProps) {
  const Tag = as as "div";
  return (
    <Tag className={cn("rounded-lg", variants[variant], pads[pad], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pb-3 mb-3 border-b border-line", className)} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3.2: Create `apps/web/components/ui/Badge.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "riskHigh"
  | "riskMid"
  | "riskLow"
  | "lime"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-paper-2 text-ink-2",
  riskHigh: "bg-risk-high/10 text-risk-high",
  riskMid: "bg-risk-mid/10 text-risk-mid",
  riskLow: "bg-risk-low/10 text-risk-low",
  lime: "bg-lime text-lime-ink",
  outline: "bg-transparent text-ink-2 border border-line",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  uppercase?: boolean;
}

export function Badge({ tone = "neutral", uppercase, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded-sm text-micro",
        tones[tone],
        uppercase && "uppercase tracking-[0.06em]",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3.3: Create `apps/web/components/ui/Segmented.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "grid gap-1 rounded-md border border-line bg-paper p-1",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "tap h-9 rounded text-small font-medium transition-colors duration-[180ms] ease-out-quint",
              active ? "bg-ink text-ink-inverse" : "text-ink-2 hover:text-ink",
            )}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span className={cn("ml-1.5 text-micro", active ? "text-ink-inverse/70" : "text-ink-3")}>
                · {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3.4: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 3.5: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/ui/Card.tsx apps/web/components/ui/Badge.tsx apps/web/components/ui/Segmented.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): layout primitives — Card, Badge, Segmented

Card with 3 variants + 3 padding sizes. Badge with 6 tones (preserves
Chinese label meaning, no toUpperCase). Segmented with optional count.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: UI Primitives — Overlay (Sheet)

**Files:**
- Create: `apps/web/components/ui/Sheet.tsx`

- [ ] **Step 4.1: Create `apps/web/components/ui/Sheet.tsx`**

```tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; loading?: boolean; danger?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  className,
}: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40"
      style={{ animation: "fadeIn 200ms var(--ease-out-quint, cubic-bezier(0.22,1,0.36,1)) both" }}
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className={cn(
          "w-full max-w-[480px] rounded-t-xl bg-paper p-5 shadow-sheet",
          className,
        )}
        style={{
          paddingBottom: "calc(20px + var(--safe-bottom))",
          animation: "sheetUp 320ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line-strong" />
        {title && <h2 className="text-h1 text-ink">{title}</h2>}
        {description && <p className="mt-2 text-body text-ink-2">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
        {(primaryAction || secondaryAction) && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="tap h-12 rounded-md bg-paper-2 text-ink text-body font-medium"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={primaryAction.loading}
                className={cn(
                  "tap h-12 rounded-md text-body font-medium disabled:opacity-60",
                  primaryAction.danger
                    ? "bg-risk-high text-white"
                    : "bg-ink text-ink-inverse",
                )}
              >
                {primaryAction.loading ? <span className="font-mono">···</span> : primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 4.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/ui/Sheet.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Sheet — bottom drawer for risk confirmations

Rounded top corners, drag indicator, ESC + backdrop close, primary +
secondary action grid.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: UI Primitives — ThemeToggle + Skeleton

**Files:**
- Create: `apps/web/components/ui/ThemeToggle.tsx`
- Create: `apps/web/components/ui/Skeleton.tsx`

- [ ] **Step 5.1: Create `apps/web/components/ui/ThemeToggle.tsx`**

```tsx
"use client";

import * as React from "react";
import { getStoredTheme, setTheme, applyTheme, watchSystemTheme, type ThemeMode } from "@/lib/theme";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [mode, setMode] = React.useState<ThemeMode>("system");
  const [effectiveDark, setEffectiveDark] = React.useState(false);

  React.useEffect(() => {
    const m = getStoredTheme();
    setMode(m);
    const apply = () => {
      applyTheme(m);
      const dark = m === "dark" || (m === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setEffectiveDark(dark);
    };
    apply();
    return watchSystemTheme(apply);
  }, []);

  function onClick() {
    const next: ThemeMode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    setTheme(next);
    const dark = next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setEffectiveDark(dark);
  }

  const label = mode === "system" ? "跟随系统" : mode === "light" ? "浅色" : "深色";

  return (
    <button
      onClick={onClick}
      aria-label={`切换主题（当前：${label}）`}
      className="tap h-10 w-10 inline-flex items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
    >
      <span key={effectiveDark ? "sun" : "moon"} className="inline-flex">
        {effectiveDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
```

- [ ] **Step 5.2: Create `apps/web/components/ui/Skeleton.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...rest} />;
}
```

- [ ] **Step 5.3: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 5.4: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/ui/ThemeToggle.tsx apps/web/components/ui/Skeleton.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): ThemeToggle + Skeleton primitives

ThemeToggle cycles system → light → dark with cross-fade and
aria-label. Skeleton uses shimmer keyframe from globals.css.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Business — NumberTicker

**Files:**
- Create: `apps/web/components/patterns/NumberTicker.tsx`

- [ ] **Step 6.1: Create `apps/web/components/patterns/NumberTicker.tsx`**

```tsx
"use client";

import * as React from "react";

export interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
}

export function NumberTicker({ value, duration = 900, className }: NumberTickerProps) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const played = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(value);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && !played.current) {
          played.current = true;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(2, -10 * p);
            setN(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}
```

- [ ] **Step 6.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 6.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/NumberTicker.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): NumberTicker — IO-triggered count-up

Eases from 0 to value with easeOutExpo. Respects prefers-reduced-motion.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: Business — StatCard

**Files:**
- Create: `apps/web/components/patterns/StatCard.tsx`

- [ ] **Step 7.1: Create `apps/web/components/patterns/StatCard.tsx`**

```tsx
import { Card } from "@/components/ui/Card";
import { NumberTicker } from "./NumberTicker";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}

export function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 border",
        accent ? "bg-ink text-ink-inverse border-ink" : "bg-paper text-ink border-line",
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-micro tracking-[0.08em] uppercase",
            accent ? "text-ink-inverse/70" : "text-ink-3",
          )}
        >
          {label}
        </p>
        {accent && <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden />}
      </div>
      <p className="mt-2 text-d2 tabular leading-none">
        <NumberTicker value={value} />
      </p>
      <p className={cn("mt-2 text-micro", accent ? "text-ink-inverse/60" : "text-ink-3")}>{hint}</p>
    </div>
  );
}
```

- [ ] **Step 7.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 7.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/StatCard.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): StatCard with NumberTicker and accent variant

Accent variant flips to ink background with lime dot indicator.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: Business — RiskCard + RiskCardCompact

**Files:**
- Create: `apps/web/components/patterns/RiskCard.tsx`
- Create: `apps/web/components/patterns/RiskCardCompact.tsx`

- [ ] **Step 8.1: Create `apps/web/components/patterns/RiskCard.tsx`**

```tsx
"use client";

import type { InspectionResultView } from "@tcm/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

function riskTone(level: string): BadgeTone {
  if (level === "HIGH" || level === "CRITICAL") return "riskHigh";
  if (level === "MEDIUM") return "riskMid";
  return "riskLow";
}

function riskBarColor(level: string): string {
  if (level === "HIGH" || level === "CRITICAL") return "bg-risk-high";
  if (level === "MEDIUM") return "bg-risk-mid";
  return "bg-risk-low";
}

function statusLabel(s: string): string {
  if (s === "PROCESSED") return "已处理";
  if (s === "IGNORED") return "已忽略";
  return "待处理";
}

function riskLabel(level: string): string {
  if (level === "CRITICAL") return "CRITICAL";
  return level;
}

export interface RiskCardProps {
  inspection: InspectionResultView;
  onIgnore: () => void;
  onProcessed: () => void;
  onDelete: () => void;
  onMute: () => void;
}

export function RiskCard({ inspection: i, onIgnore, onProcessed, onDelete, onMute }: RiskCardProps) {
  const isHigh = i.riskLevel === "HIGH" || i.riskLevel === "CRITICAL";
  return (
    <article
      className={cn(
        "rounded-lg border border-line bg-paper p-4 relative",
        isHigh && "risk-pulse",
      )}
    >
      <span
        className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r", riskBarColor(i.riskLevel))}
        aria-hidden
      />
      <div className="flex items-center justify-between pl-2">
        <Badge tone={riskTone(i.riskLevel)} uppercase>
          {riskLabel(i.riskLevel)}
        </Badge>
        <span className="text-micro text-ink-3">{formatRelativeTime(i.createdAt)}</span>
      </div>
      <h3 className="mt-3 pl-2 text-h3 text-ink truncate">{i.title || "未命名帖子"}</h3>
      <p className="mt-1 pl-2 text-small text-ink-2 line-clamp-2">{i.content || i.reason}</p>
      <p className="mt-2 pl-2 text-micro text-ink-3">
        作者：{i.authorName ?? "未知"} · 赞 {i.likeCount} · 评论 {i.commentCount}
      </p>
      <div className="mt-3 mx-2 rounded-md bg-paper-2 px-3 py-2 text-small text-ink flex gap-2">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-lime shrink-0" aria-hidden />
        <span>AI：{i.reason}</span>
      </div>
      <div className="mt-3 pl-2 grid grid-cols-4 gap-1.5">
        <button onClick={onIgnore} className="tap h-8 rounded-md text-micro text-ink-2 hover:bg-paper-2">
          忽略
        </button>
        <button onClick={onProcessed} className="tap h-8 rounded-md bg-paper-2 text-micro text-ink">
          {statusLabel("PROCESSED")}
        </button>
        <button onClick={onDelete} className="tap h-8 rounded-md text-micro text-risk-high hover:bg-risk-high/10">
          删除
        </button>
        <button onClick={onMute} className="tap h-8 rounded-md text-micro text-risk-mid hover:bg-risk-mid/10">
          禁言
        </button>
      </div>
    </article>
  );
}
```

- [ ] **Step 8.2: Create `apps/web/components/patterns/RiskCardCompact.tsx`**

```tsx
"use client";

import type { InspectionResultView } from "@tcm/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

function riskTone(level: string): BadgeTone {
  if (level === "HIGH" || level === "CRITICAL") return "riskHigh";
  if (level === "MEDIUM") return "riskMid";
  return "riskLow";
}

function riskLabel(level: string): string {
  if (level === "CRITICAL") return "CRITICAL";
  return level;
}

export interface RiskCardCompactProps {
  inspection: InspectionResultView;
}

export function RiskCardCompact({ inspection: i }: RiskCardCompactProps) {
  return (
    <div className="rounded-md bg-paper-2 p-3 flex items-start gap-3">
      <Badge tone={riskTone(i.riskLevel)} uppercase className="shrink-0">
        {riskLabel(i.riskLevel)}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className={cn("text-small text-ink truncate")}>{i.title || "未命名帖子"}</p>
        <p className="mt-0.5 text-mini text-ink-3 line-clamp-1">{i.reason}</p>
        <p className="mt-1 text-micro text-ink-3">
          {i.authorName ?? "未知"} · 赞 {i.likeCount} · 评论 {i.commentCount}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.3: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 8.4: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/RiskCard.tsx apps/web/components/patterns/RiskCardCompact.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): RiskCard (full + compact) with HIGH pulse

Left 3px color bar, AI reason sunken block, 4 action buttons with
risk-colored hover. Compact variant for Home page list.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: Business — HotTopicItem

**Files:**
- Create: `apps/web/components/patterns/HotTopicItem.tsx`

- [ ] **Step 9.1: Create `apps/web/components/patterns/HotTopicItem.tsx`**

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HotTopicItemProps {
  rank: number;
  title: string;
  authorName?: string;
  likeCount?: number;
  commentCount?: number;
  href?: string;
}

export function HotTopicItem({ rank, title, authorName, likeCount, commentCount, href }: HotTopicItemProps) {
  const inner = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-h3 font-semibold tabular",
          rank <= 3 ? "bg-lime text-lime-ink" : "bg-paper-2 text-ink-3",
        )}
      >
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-h3 text-ink truncate">{title}</p>
        <p className="mt-0.5 text-micro text-ink-3">
          {authorName ?? "未知"} · 赞 {likeCount ?? 0} · 评论 {commentCount ?? 0}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block -mx-3 px-3 py-2.5 rounded-md hover:bg-paper-2 transition-colors"
      >
        {inner}
      </Link>
    );
  }
  return <div className="py-2.5">{inner}</div>;
}
```

- [ ] **Step 9.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 9.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/HotTopicItem.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): HotTopicItem with lime top-3 rank badge

Optional href wraps the row in a Link with hover background.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: Business — TaskCard

**Files:**
- Create: `apps/web/components/patterns/TaskCard.tsx`

- [ ] **Step 10.1: Create `apps/web/components/patterns/TaskCard.tsx`**

```tsx
"use client";

import type { TaskRunView, TaskView } from "@tcm/shared";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  INSPECTION: "频道巡检",
  HOT_SUMMARY: "每日热门",
};

type ScheduleFormatter = (t?: string | null) => string;

const SCHEDULE_LABEL: Record<string, ScheduleFormatter> = {
  DAILY: (t?: string | null) => `每日 · ${t ?? "23:30"}`,
  IMMEDIATE: (_?: string | null) => "立即任务",
};

const STATUS_TONE = {
  ACTIVE: "riskLow" as const,
  PAUSED: "outline" as const,
};

const RUN_STATUS_LABEL: Record<string, string> = {
  PENDING: "排队中",
  RUNNING: "运行中",
  SUCCESS: "成功",
  FAILED: "失败",
  CANCELED: "已取消",
};

export interface TaskCardProps {
  task: TaskView;
  lastRun?: TaskRunView;
  onTrigger: () => void;
  busy?: boolean;
}

export function TaskCard({ task: t, lastRun, onTrigger, busy }: TaskCardProps) {
  const schedule = (SCHEDULE_LABEL[t.scheduleMode] as ScheduleFormatter)(t.defaultTime);

  return (
    <article className="rounded-lg border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h2 text-ink">{TYPE_LABEL[t.type] ?? t.type}</h3>
          <p className="mt-0.5 text-mini text-ink-3">
            {schedule} · {t.enabled ? "启用" : "停用"}
          </p>
        </div>
        <button
          onClick={onTrigger}
          disabled={busy}
          className="tap h-8 px-3 rounded-md border border-line text-mini text-ink hover:bg-paper-2 disabled:opacity-60"
        >
          {busy ? "排队中..." : "运行一次"}
        </button>
      </div>
      {lastRun && (
        <div className="mt-3 pt-3 border-t border-line flex items-center gap-2 text-micro text-ink-3">
          <Badge tone={t.status === "ACTIVE" ? STATUS_TONE.ACTIVE : STATUS_TONE.PAUSED} uppercase>
            {t.status}
          </Badge>
          <span>最近：{RUN_STATUS_LABEL[lastRun.status] ?? lastRun.status}</span>
          <span>·</span>
          <span>{formatRelativeTime(lastRun.createdAt)}</span>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 10.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 10.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/TaskCard.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): TaskCard with type/schedule labels and last run

Chinese type labels, schedule string builder, last run status badge
with relative timestamp.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: Business — TokenRow + ModelRow

**Files:**
- Create: `apps/web/components/patterns/TokenRow.tsx`
- Create: `apps/web/components/patterns/ModelRow.tsx`

- [ ] **Step 11.1: Create `apps/web/components/patterns/TokenRow.tsx`**

```tsx
"use client";

import type { TokenView } from "@tcm/shared";
import { Badge } from "@/components/ui/Badge";

export interface TokenRowProps {
  token: TokenView;
  onSync: () => void;
  busy?: boolean;
}

export function TokenRow({ token, onSync, busy }: TokenRowProps) {
  return (
    <div className="py-3 border-t border-line first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-h3 text-ink">{token.label}</p>
          <p className="mt-0.5 text-micro text-ink-3">尾号 ···{token.tokenTail}</p>
        </div>
        <Badge tone={token.status === "ACTIVE" ? "riskLow" : "riskHigh"}>
          {token.status === "ACTIVE" ? "有效" : "失效"}
        </Badge>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={onSync}
          disabled={busy}
          className="tap h-7 px-2.5 rounded-sm text-mini text-ink-2 hover:bg-paper-2 disabled:opacity-60"
        >
          {busy ? "同步中..." : "同步频道"}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 11.2: Create `apps/web/components/patterns/ModelRow.tsx`**

```tsx
import type { ModelView } from "@tcm/shared";

export interface ModelRowProps {
  model: ModelView;
}

export function ModelRow({ model: m }: ModelRowProps) {
  return (
    <div className="py-3 border-t border-line first:border-t-0">
      <p className="text-h3 text-ink">{m.model}</p>
      <p className="mt-0.5 text-micro text-ink-3">{m.baseUrl ?? "https://api.openai.com"}</p>
    </div>
  );
}
```

- [ ] **Step 11.3: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 11.4: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/TokenRow.tsx apps/web/components/patterns/ModelRow.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): TokenRow + ModelRow

Token shows ACTIVE/INVALID badge + sync action. Model shows model name
+ base URL. Both use hairline separators.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: Business — EmptyState

**Files:**
- Create: `apps/web/components/patterns/EmptyState.tsx`

- [ ] **Step 12.1: Create `apps/web/components/patterns/EmptyState.tsx`**

```tsx
import * as React from "react";

function FolderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13l3-9h12l3 9v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

const ICONS = { folder: FolderIcon, inbox: InboxIcon, pulse: PulseIcon } as const;

export type EmptyIcon = keyof typeof ICONS;

export interface EmptyStateProps {
  icon: EmptyIcon;
  title: string;
  hint?: string;
}

export function EmptyState({ icon, title, hint }: EmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center py-10 text-ink-3">
      <Icon />
      <p className="mt-4 text-small text-ink-2">{title}</p>
      {hint && <p className="mt-1 text-mini text-ink-3">{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 12.2: Run typecheck**

Run: `npm -w apps/web run typecheck`
Expected: PASS

- [ ] **Step 12.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/components/patterns/EmptyState.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): EmptyState with 3 line-art icons (folder/inbox/pulse)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 13: BottomNav

**Files:**
- Modify: `apps/web/components/BottomNav.tsx` (move to `components/layout/BottomNav.tsx`)
- Modify: `apps/web/app/(tabs)/layout.tsx`

- [ ] **Step 13.1: Create new `apps/web/components/layout/BottomNav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/home", label: "首页", icon: HomeIcon },
  { href: "/tasks", label: "任务", icon: TaskIcon },
  { href: "/results", label: "结果", icon: ResultIcon },
  { href: "/profile", label: "我的", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[480px] bg-paper border-t border-line"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="主导航"
    >
      <ul className="grid grid-cols-5 items-center px-1.5">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.href} className="flex justify-center">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                aria-label={t.label}
                className="tap h-14 flex items-center"
              >
                <span
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 rounded-full transition-colors duration-[180ms]",
                    active ? "bg-ink text-ink-inverse" : "text-ink-3",
                  )}
                >
                  <Icon className={active ? "text-ink-inverse" : "text-ink-3"} />
                  <span className="text-micro">{t.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex justify-center">
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function TaskIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ResultIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20V8m6 12V4m6 16v-7m4 7H4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ProfileIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 13.2: Delete old `apps/web/components/BottomNav.tsx`**

Run: `rm "D:/Personal/ai-future-studio/tencent-channel-manage/apps/web/components/BottomNav.tsx"`

- [ ] **Step 13.3: Update `apps/web/app/(tabs)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-enter pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 13.4: Run typecheck + lint**

Run: `npm -w apps/web run typecheck && npm -w apps/web run lint`
Expected: PASS

- [ ] **Step 13.5: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add -A apps/web/components apps/web/app/\(tabs\)/layout.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): BottomNav — pill active state + 5th ThemeToggle slot

Move to components/layout/. Active state is inverted pill (ink bg +
ink-inverse text) instead of generic blue. ThemeToggle occupies
5th grid cell.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 14: Home page

**Files:**
- Modify: `apps/web/app/(tabs)/home/page.tsx`

- [ ] **Step 14.1: Replace `apps/web/app/(tabs)/home/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatLocalDate } from "@/lib/utils";
import type { HotSummaryView, InspectionResultView, TaskRunView, TaskView } from "@tcm/shared";
import { StatCard } from "@/components/patterns/StatCard";
import { RiskCardCompact } from "@/components/patterns/RiskCardCompact";
import { HotTopicItem } from "@/components/patterns/HotTopicItem";
import { EmptyState } from "@/components/patterns/EmptyState";

export default function HomePage() {
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [summaries, setSummaries] = useState<HotSummaryView[]>([]);
  const [inspections, setInspections] = useState<InspectionResultView[]>([]);
  const [running, setRunning] = useState<TaskRunView[]>([]);

  useEffect(() => {
    (async () => {
      const ts = await api.listTasks();
      setTasks(ts);
      const ss = await api.listSummaries();
      setSummaries(ss);
      setInspections(await api.listInspections());
      const all = await Promise.all(ts.map((t) => api.listRuns(t.id)));
      setRunning(all.flat().filter((r) => r.status === "RUNNING" || r.status === "PENDING"));
    })().catch(console.error);
  }, []);

  const pending = inspections.filter((i) => i.status === "PENDING");
  const todayTopics = summaries[0]?.items as Array<{ title?: string; content?: string; likeCount?: number; commentCount?: number; authorName?: string }> | undefined;

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <p className="text-micro tracking-[0.08em] text-ink-3 font-mono">{formatLocalDate()}</p>
        <h1 className="mt-1.5 text-d2 text-ink">今日运营台</h1>
        <p className="mt-1 text-body text-ink-2">早上好，{typeof window !== "undefined" ? (localStorage.getItem("tcm_username") ?? "频道主") : "频道主"}。</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      <section className="mt-7 grid grid-cols-3 gap-2.5 stagger">
        <StatCard label="TASKS" value={tasks.length} hint="全部" />
        <StatCard label="RUNNING" value={running.length} hint="进行中" accent />
        <StatCard label="PENDING" value={pending.length} hint="待处理" />
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">待处理风险</h2>
          <span className="text-micro text-ink-3">· {pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="pulse" title="今天暂时没有待处理风险" />
          </div>
        ) : (
          <ul className="mt-3 space-y-2 stagger">
            {pending.slice(0, 3).map((i) => (
              <li key={i.id}>
                <RiskCardCompact inspection={i} />
              </li>
            ))}
          </ul>
        )}
        {pending.length > 0 && (
          <Link
            href="/results"
            className="mt-3 inline-flex items-center gap-1 text-small text-ink-2 hover:text-ink"
          >
            去处理 →
          </Link>
        )}
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">今日热门</h2>
          <span className="text-micro text-ink-3">· {todayTopics?.length ?? 0} 个话题</span>
        </div>
        {!todayTopics || todayTopics.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="inbox" title="今天还没有热门汇总" hint="去任务页跑一个试试" />
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-line bg-paper p-1.5">
            {todayTopics.slice(0, 3).map((t, idx) => (
              <HotTopicItem
                key={idx}
                rank={idx + 1}
                title={t.title ?? t.content ?? "未命名"}
                authorName={t.authorName}
                likeCount={t.likeCount}
                commentCount={t.commentCount}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-9 grid grid-cols-2 gap-2.5">
        <Link
          href="/tasks"
          className="tap h-12 rounded-md border border-line bg-paper text-small text-ink inline-flex items-center justify-center hover:bg-paper-2"
        >
          管理任务 →
        </Link>
        <Link
          href="/results"
          className="tap h-12 rounded-md border border-line bg-paper text-small text-ink inline-flex items-center justify-center hover:bg-paper-2"
        >
          查看结果 →
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 14.2: Run typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS

- [ ] **Step 14.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/app/\(tabs\)/home/page.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Home — editorial dashboard layout

Date micro label, d2 title + greeting, decorative hairline, 3 StatCards
with NumberTicker, RiskCardCompact list, HotTopicItem, action links.
Stagger animations on lists.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 15: Tasks page

**Files:**
- Modify: `apps/web/app/(tabs)/tasks/page.tsx`

- [ ] **Step 15.1: Replace `apps/web/app/(tabs)/tasks/page.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ChannelView, GuildView, ModelView, TaskRunView, TaskView, TokenView } from "@tcm/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Segmented } from "@/components/ui/Segmented";
import { TaskCard } from "@/components/patterns/TaskCard";
import { EmptyState } from "@/components/patterns/EmptyState";
import { cn } from "@/lib/utils";

type Kind = "INSPECTION" | "HOT_SUMMARY";
type Schedule = "IMMEDIATE" | "DAILY";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [runsByTask, setRunsByTask] = useState<Record<string, TaskRunView[]>>({});
  const [tokens, setTokens] = useState<TokenView[]>([]);
  const [models, setModels] = useState<ModelView[]>([]);
  const [guilds, setGuilds] = useState<Array<GuildView & { channels?: ChannelView[] }>>([]);
  const [channels, setChannels] = useState<ChannelView[]>([]);
  const [kind, setKind] = useState<Kind>("INSPECTION");
  const [tokenId, setTokenId] = useState("");
  const [guildId, setGuildId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [scheduleMode, setScheduleMode] = useState<Schedule>("DAILY");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    const [ts, tk, ms] = await Promise.all([api.listTasks(), api.listTokens(), api.listModels()]);
    setTasks(ts);
    setTokens(tk);
    setModels(ms);
    const map: Record<string, TaskRunView[]> = {};
    await Promise.all(ts.map(async (t) => { map[t.id] = await api.listRuns(t.id); }));
    setRunsByTask(map);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  useEffect(() => {
    if (!tokenId) return;
    api.listGuilds(tokenId).then(setGuilds).catch(console.error);
  }, [tokenId]);

  useEffect(() => {
    if (!guildId) return;
    api.listChannels(guildId).then(setChannels).catch(console.error);
  }, [guildId]);

  const selectedModel = useMemo(() => models[0], [models]);
  const canCreate = Boolean(tokenId && guildId && channelId && (kind !== "INSPECTION" || selectedModel));

  async function syncChannels() {
    if (!guildId) return;
    setBusy("sync-channels");
    setMessage(null);
    try {
      const res = await api.syncChannels(guildId);
      setMessage({ kind: "ok", text: `已同步 ${res.count} 个板块` });
      setChannels(await api.listChannels(guildId));
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function createTask() {
    if (!canCreate) return;
    setBusy("create");
    setMessage(null);
    try {
      const res = await api.createTask({
        type: kind,
        tokenId,
        guildId,
        channelId,
        modelId: kind === "INSPECTION" ? selectedModel!.id : null,
        scheduleMode,
        defaultTime: "23:30",
      });
      setMessage({ kind: "ok", text: res.runId ? "任务已创建并开始执行" : "任务已创建" });
      await refresh();
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function trigger(id: string) {
    setBusy(id);
    setMessage(null);
    try {
      await api.runTask(id);
      await refresh();
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <h1 className="text-d2 text-ink">任务</h1>
        <p className="mt-1 text-body text-ink-2">配置你的自动化运营。</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      {message && (
        <p
          className={cn(
            "mt-5 rounded-md px-3 py-2 text-small",
            message.kind === "ok" ? "bg-lime text-lime-ink" : "bg-risk-high/10 text-risk-high",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="mt-7">
        <SectionTitle step="1" title="选择任务类型" />
        <div className="mt-3">
          <Segmented<Kind>
            value={kind}
            onChange={setKind}
            options={[
              { value: "INSPECTION", label: "频道巡检" },
              { value: "HOT_SUMMARY", label: "每日热门" },
            ]}
          />
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle step="2" title="关联频道" />
        <div className="mt-3 rounded-lg bg-paper-2 p-4 space-y-3">
          <Select value={tokenId} onChange={(e) => { setTokenId(e.target.value); setGuildId(""); setChannelId(""); }}>
            <option value="">选择 Token</option>
            {tokens.map((t) => <option key={t.id} value={t.id}>{t.label} · {t.status}</option>)}
          </Select>
          <Select value={guildId} onChange={(e) => { setGuildId(e.target.value); setChannelId(""); }}>
            <option value="">选择频道</option>
            {guilds.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.role ?? "成员"}</option>)}
          </Select>
          <div className="flex gap-2">
            <Select className="flex-1" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
              <option value="">选择板块</option>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Button variant="secondary" size="md" onClick={syncChannels} disabled={!guildId || busy === "sync-channels"} loading={busy === "sync-channels"}>
              同步
            </Button>
          </div>
        </div>
      </section>

      {kind === "INSPECTION" && (
        <section className="mt-6">
          <SectionTitle step="3" title="模型" />
          <div className="mt-3 rounded-md bg-paper-2 px-3 py-2 text-small text-ink-2">
            当前：{selectedModel ? selectedModel.model : "未配置"}
            {!selectedModel && <span className="ml-2 text-risk-mid">先去我的配置</span>}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionTitle step={kind === "INSPECTION" ? "4" : "3"} title="执行计划" />
        <div className="mt-3">
          <Segmented<Schedule>
            value={scheduleMode}
            onChange={setScheduleMode}
            options={[
              { value: "IMMEDIATE", label: "立即执行" },
              { value: "DAILY", label: "每日 23:30" },
            ]}
          />
        </div>
        <p className="mt-3 text-mini text-ink-3 leading-relaxed">
          {kind === "INSPECTION" ? "扫描当天帖子，最多 500 条，已巡检帖子自动跳过。" : "统计上海时区当天发布的帖子，按当前点赞数取 Top 10。"}
        </p>
      </section>

      <div className="mt-7">
        <Button variant="primary" size="lg" fullWidth onClick={createTask} disabled={!canCreate} loading={busy === "create"}>
          {scheduleMode === "IMMEDIATE" ? "保存并执行" : "保存任务"}
        </Button>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">我的任务</h2>
          <span className="text-micro text-ink-3">· {tasks.length}</span>
        </div>
        {tasks.length === 0 ? (
          <div className="mt-3 rounded-lg border border-line bg-paper">
            <EmptyState icon="folder" title="还没有任务" hint="上面配置一个开始" />
          </div>
        ) : (
          <ul className="mt-3 space-y-3 stagger">
            {tasks.map((t) => (
              <li key={t.id}>
                <TaskCard task={t} lastRun={runsByTask[t.id]?.[0]} onTrigger={() => trigger(t.id)} busy={busy === t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SectionTitle({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-micro font-mono text-ink-3">{step}</span>
      <h3 className="text-h3 text-ink-2">{title}</h3>
    </div>
  );
}
```

- [ ] **Step 15.2: Run typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS

- [ ] **Step 15.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/app/\(tabs\)/tasks/page.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Tasks — ①②③④ decision flow

Numbered section titles, sunken selection cards, Segmented controls,
inline message bar, TaskCard list with stagger.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 16: Results page

**Files:**
- Modify: `apps/web/app/(tabs)/results/page.tsx`

- [ ] **Step 16.1: Replace `apps/web/app/(tabs)/results/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HotSummaryView, InspectionResultView } from "@tcm/shared";
import { Segmented } from "@/components/ui/Segmented";
import { Sheet } from "@/components/ui/Sheet";
import { RiskCard } from "@/components/patterns/RiskCard";
import { HotTopicItem } from "@/components/patterns/HotTopicItem";
import { EmptyState } from "@/components/patterns/EmptyState";

type Tab = "inspection" | "hot";

export default function ResultsPage() {
  const [tab, setTab] = useState<Tab>("inspection");
  const [summaries, setSummaries] = useState<HotSummaryView[]>([]);
  const [inspections, setInspections] = useState<InspectionResultView[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [confirm, setConfirm] = useState<{ id: string; action: "delete_post" | "mute_author" } | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const [ss, ii] = await Promise.all([api.listSummaries(date), api.listInspections()]);
    setSummaries(ss);
    setInspections(ii);
  }

  useEffect(() => {
    refresh().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function mark(id: string, status: "PROCESSED" | "IGNORED") {
    await api.updateInspection(id, status);
    await refresh();
  }

  async function doRiskAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.riskAction(confirm.id, confirm.action, "mobile_confirmed");
      await mark(confirm.id, "PROCESSED");
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  const inspectionCount = inspections.length;
  const hotCount = summaries.reduce(
    (sum, s) => sum + ((s.items as unknown[])?.length ?? 0),
    0,
  );

  return (
    <main className="px-5 pt-8 pb-12">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-d2 text-ink">结果</h1>
          <div className="mt-5 h-px w-8 bg-ink" />
        </div>
        <div className="pb-2 flex items-center gap-2 text-micro text-ink-3 font-mono">
          <span>📅</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-sm border border-line bg-paper px-2 py-1 text-micro text-ink font-mono outline-none focus:border-ink"
          />
        </div>
      </header>

      <div className="mt-7">
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "inspection", label: "巡检", count: inspectionCount },
            { value: "hot", label: "热门", count: hotCount },
          ]}
        />
      </div>

      {tab === "inspection" ? (
        <section className="mt-5">
          {inspections.length === 0 ? (
            <div className="rounded-lg border border-line bg-paper">
              <EmptyState icon="pulse" title="暂无巡检结果" />
            </div>
          ) : (
            <ul className="space-y-3 stagger">
              {inspections.map((i) => (
                <li key={i.id}>
                  <RiskCard
                    inspection={i}
                    onIgnore={() => mark(i.id, "IGNORED")}
                    onProcessed={() => mark(i.id, "PROCESSED")}
                    onDelete={() => setConfirm({ id: i.id, action: "delete_post" })}
                    onMute={() => setConfirm({ id: i.id, action: "mute_author" })}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-5">
          {summaries.length === 0 || hotCount === 0 ? (
            <div className="rounded-lg border border-line bg-paper">
              <EmptyState icon="inbox" title="今天还没有生成热门汇总" />
            </div>
          ) : (
            <ul className="space-y-3 stagger">
              {summaries.map((summary) => (
                <li key={summary.id} className="rounded-lg border border-line bg-paper p-4">
                  <p className="text-micro font-mono text-ink-3 tracking-[0.08em]">DATE · {summary.date}</p>
                  <div className="mt-2">
                    {((summary.items as Array<{ rank?: number; title?: string; content?: string; likeCount?: number; commentCount?: number; authorName?: string }>) ?? []).map((item, index) => (
                      <HotTopicItem
                        key={index}
                        rank={item.rank ?? index + 1}
                        title={item.title || item.content || "未命名帖子"}
                        authorName={item.authorName}
                        likeCount={item.likeCount}
                        commentCount={item.commentCount}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Sheet
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.action === "delete_post" ? "确认删除这条帖子？" : "确认禁言作者？"}
        description="这是高风险操作。MVP 阶段会记录审计日志，正式执行能力后续接入 CLI 命令。"
        primaryAction={{
          label: "确认",
          danger: true,
          loading: busy,
          onClick: doRiskAction,
        }}
        secondaryAction={{
          label: "取消",
          onClick: () => setConfirm(null),
        }}
      />
    </main>
  );
}
```

- [ ] **Step 16.2: Run typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS

- [ ] **Step 16.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/app/\(tabs\)/results/page.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Results — Segmented with counts, Sheet for confirm

Tab counts derived from data, mono date picker in header, RiskCard
list with stagger, Sheet replaces inline modal.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 17: Profile page

**Files:**
- Modify: `apps/web/app/(tabs)/profile/page.tsx`

- [ ] **Step 17.1: Replace `apps/web/app/(tabs)/profile/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import type { ModelView, TokenView } from "@tcm/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TokenRow } from "@/components/patterns/TokenRow";
import { ModelRow } from "@/components/patterns/ModelRow";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenView[]>([]);
  const [models, setModels] = useState<ModelView[]>([]);
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    const [t, m] = await Promise.all([api.listTokens(), api.listModels()]);
    setTokens(t);
    setModels(m);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  async function addToken() {
    if (!label || !secret) return;
    setBusy("token");
    setMessage(null);
    try {
      const created = await api.createToken(label, secret);
      await api.checkToken(created.id);
      await refresh();
      setLabel("");
      setSecret("");
      setMessage({ kind: "ok", text: "Token 已保存并校验" });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function syncGuilds(id: string) {
    setBusy(id);
    setMessage(null);
    try {
      const res = await api.syncGuilds(id);
      setMessage({ kind: "ok", text: `已同步 ${res.count} 个频道` });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function addModel() {
    if (!model || !apiKey) return;
    setBusy("model");
    setMessage(null);
    try {
      const created = await api.createModel({ provider: "custom", model, baseUrl, apiKey });
      await api.testModel(created.id).catch(() => undefined);
      await refresh();
      setModel("");
      setApiKey("");
      setMessage({ kind: "ok", text: "模型配置已保存" });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  function logout() {
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tcm_username");
    }
    router.replace("/login");
  }

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <h1 className="text-d2 text-ink">我的</h1>
        <p className="mt-1 text-body text-ink-2 font-mono">admin</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      {message && (
        <p
          className={cn(
            "mt-5 rounded-md px-3 py-2 text-small",
            message.kind === "ok" ? "bg-lime text-lime-ink" : "bg-risk-high/10 text-risk-high",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="mt-7">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">账户</h2>
        </div>
        <button
          onClick={logout}
          className="tap mt-3 w-full h-12 rounded-lg border border-line bg-paper text-small text-risk-high flex items-center justify-between px-4 hover:bg-risk-high/5"
        >
          <span>退出登录</span>
          <span aria-hidden>→</span>
        </button>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">频道 Token</h2>
          <span className="text-micro text-ink-3">· {tokens.length}</span>
        </div>
        <Card pad="md" className="mt-3 space-y-2">
          <Input placeholder="备注名，如主号" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Textarea
            placeholder="粘贴 connect.qq.com/ai 的 token"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            rows={4}
            className="min-h-24"
          />
          <Button variant="primary" size="md" fullWidth onClick={addToken} loading={busy === "token"} disabled={!label || !secret}>
            保存并校验
          </Button>
        </Card>
        {tokens.length > 0 && (
          <Card pad="md" className="mt-3">
            {tokens.map((t) => (
              <TokenRow key={t.id} token={t} onSync={() => syncGuilds(t.id)} busy={busy === t.id} />
            ))}
          </Card>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">模型配置</h2>
          <span className="text-micro text-ink-3">· {models.length}</span>
        </div>
        <Card pad="md" className="mt-3 space-y-2">
          <Input placeholder="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          <Input placeholder="Model，如 gpt-4o-mini" value={model} onChange={(e) => setModel(e.target.value)} />
          <Input placeholder="API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Button variant="primary" size="md" fullWidth onClick={addModel} loading={busy === "model"} disabled={!model || !apiKey}>
            保存并测试
          </Button>
        </Card>
        {models.length > 0 && (
          <Card pad="md" className="mt-3">
            {models.map((m) => (
              <ModelRow key={m.id} model={m} />
            ))}
          </Card>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 17.2: Run typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS

- [ ] **Step 17.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/app/\(tabs\)/profile/page.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Profile — account/token/model sections with Cards

Three sectioned Cards, dedicated logout row, inline status messages
on lime / risk-high. TokenRow and ModelRow lists.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 18: Login page

**Files:**
- Modify: `apps/web/app/login/page.tsx`

- [ ] **Step 18.1: Replace `apps/web/app/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-micro text-ink-3 tracking-[0.04em]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api.login(username, password);
      setToken(r.token);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("tcm_username", r.user.username);
      }
      router.replace("/home");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-7 pt-16 pb-12">
      <header>
        <h1 className="font-display text-d1 text-ink tracking-[0.06em]">TENCENT</h1>
        <p className="mt-2 text-micro text-ink-3 tracking-[0.18em]">CHANNELS · OPS</p>
      </header>

      <div className="mt-12 h-px w-8 bg-ink" />

      <h2 className="mt-6 text-h1 text-ink">频道运营工作台</h2>
      <p className="mt-1.5 text-body text-ink-2">用 AI 守好你的频道。</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Field label="用户名">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            inputMode="text"
          />
        </Field>
        <Field label="密码">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {err && <p className="text-small text-risk-high">{err}</p>}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={busy}
        >
          登录
        </Button>
      </form>

      <p className={cn("mt-auto pt-10 text-micro text-ink-3 tracking-[0.04em]")}>v0.1 · 2026</p>
    </main>
  );
}
```

- [ ] **Step 18.2: Run typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS

- [ ] **Step 18.3: Commit**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" add apps/web/app/login/page.tsx
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" commit -m "feat(web): Login — wordmark hero cover

Editorial cover: TENCENT wordmark + CHANNELS · OPS micro label,
decorative hairline, mission subtitle, focused form. Stores username
to localStorage for Home greeting.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 19: Final verification

**Files:** none modified

This is the gate before declaring the redesign complete. Run the full verification suite and walk through the spec's visual checklist.

- [ ] **Step 19.1: Run full typecheck + lint + build**

Run:
```bash
npm -w apps/web run typecheck && npm -w apps/web run lint && npm -w apps/web run build
```
Expected: PASS with 0 errors and 0 warnings (other than known framework noise)

- [ ] **Step 19.2: Mock-mode smoke test**

Run:
```bash
NEXT_PUBLIC_USE_MOCK=1 npm -w apps/web run dev
```
Expected: Server starts on `http://localhost:3000` in < 5s, no compile errors in terminal

Then in a second terminal:
```bash
curl -sI http://localhost:3000/login | head -1
curl -sI http://localhost:3000/home | head -1
curl -sI http://localhost:3000/tasks | head -1
curl -sI http://localhost:3000/results | head -1
curl -sI http://localhost:3000/profile | head -1
```
Expected: All 5 return `HTTP/1.1 200 OK`

Stop dev server (Ctrl+C).

- [ ] **Step 19.3: Visual verification (light mode)**

Open Chrome DevTools → iPhone 14 Pro → visit `http://localhost:3000/login`. Walk through the spec's section 8.2 checklist:

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

- [ ] **Step 19.4: Commit final (if any uncommitted tweaks)**

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" status
```
If clean: nothing to do.
If modified: commit with a focused message describing the tweak.

---

## Self-Review

**1. Spec coverage:**

| Spec section | Covered by |
|---|---|
| §2.1 配色 (CSS variables + Tailwind) | Task 1.1, 1.2 |
| §2.2 字体 (next/font) | Task 1.3 |
| §2.3 字号刻度 | Task 1.1 |
| §2.4 圆角阴影 | Task 1.1 |
| §2.5 动效曲线 | Task 1.1 |
| §2.6 主题切换 / FOUC | Task 1.3 (script) + 1.4 (lib) + Task 5 (ThemeToggle) |
| §4.1 Button (6 变体) | Task 2.1 |
| §4.2 Input/Textarea/Select (lime 下边) | Tasks 2.2-2.4 |
| §4.3 Card (3 变体) | Task 3.1 |
| §4.4 Badge (6 色调) | Task 3.2 |
| §4.5 Segmented (with count) | Task 3.3 |
| §4.6 Sheet | Task 4.1 |
| §4.7 ThemeToggle | Task 5.1 |
| §4.8 Skeleton | Task 5.2 |
| §5.1 NumberTicker | Task 6 |
| §5.2 StatCard (accent) | Task 7 |
| §5.3 RiskCard (3px 竖条 + HIGH 呼吸) | Task 8.1 |
| §5.4 RiskCardCompact | Task 8.2 |
| §5.5 HotTopicItem (lime top-3) | Task 9 |
| §5.6 TaskCard | Task 10 |
| §5.7 TokenRow / ModelRow | Task 11 |
| §5.8 EmptyState (3 icons) | Task 12 |
| §6.1 登录页 (wordmark + 装饰线) | Task 18 |
| §6.2 首页 (date micro + decorative line) | Task 14 |
| §6.3 任务页 (①②③④ decision flow) | Task 15 |
| §6.4 结果页 (Segmented with count + Sheet) | Task 16 |
| §6.5 我的页 (3 sections) | Task 17 |
| §6.6 底部导航 (5 格 + 药丸) | Task 13 |
| §7 动效系统 (stagger, page enter, sheet, pulse, shimmer, theme cross-fade) | All in Task 1.2 (globals.css) |
| §8 验证策略 (自动化 + 视觉清单) | Task 19 |
| §10 范围外 | Not implemented by design |

All spec sections are covered. No gaps.

**2. Placeholder scan:**

- No "TBD", "TODO", "implement later" in any step.
- No "add appropriate error handling" — error paths are explicit (try/catch with `setMessage`).
- No "write tests for the above" — verification is typecheck + lint + build + manual visual.
- No "similar to Task N" — each task repeats full code.
- All steps with code changes include the full code block.

**3. Type consistency:**

- `cn(...ClassValue[])` defined in Task 1.5, used in all subsequent components.
- `formatRelativeTime(input: Date | string, now?: Date)` defined in Task 1.5, used in RiskCard (8.1), TaskCard (10).
- `formatLocalDate(d?: Date)` defined in Task 1.5, used in Home (14).
- `Button` props consistent across Tasks 2.1, 14, 15, 17, 18.
- `Card variant` enum consistent across Tasks 3.1, 14, 17.
- `BadgeTone` enum consistent across Tasks 3.2, 8.1, 8.2, 10.
- `Segmented<T>` generic consistent across Tasks 3.3, 15, 16.
- `Sheet` props consistent in Tasks 4.1, 16.
- `StatCard` props consistent in Task 7 and usage in Task 14.
- `RiskCard` / `RiskCardCompact` props consistent in Tasks 8.1, 8.2 and usage in 14, 16.
- `HotTopicItem` props consistent in Tasks 9 and usage in 14, 16.
- `TaskCard` props consistent in Task 10 and usage in 15.
- `TokenRow` / `ModelRow` props consistent in Task 11 and usage in 17.
- `EmptyState` props consistent in Task 12 and usage in 14, 15, 16.

No type mismatches.

---

## Final commit (if not done above)

```bash
git -C "D:/Personal/ai-future-studio/tencent-channel-manage" log --oneline | head -25
```

Expected: ~19 commits for tasks 1-19, plus the spec commit. Working tree clean.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-06-tencent-channel-ui-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration with isolation

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
