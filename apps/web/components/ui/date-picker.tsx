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
