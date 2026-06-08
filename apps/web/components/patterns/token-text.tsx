export function TokenText({ tail }: { tail?: string }) {
  return <span className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[11px] text-ink-variant">tk_****{tail || "----"}</span>;
}
