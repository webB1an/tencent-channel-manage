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
