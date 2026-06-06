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
