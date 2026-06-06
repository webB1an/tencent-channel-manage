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
