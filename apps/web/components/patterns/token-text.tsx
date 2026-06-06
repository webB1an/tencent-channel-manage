export function TokenText({ tail }: { tail?: string }) {
  return <span className="font-mono tabular text-text-2">tk_****{tail || "----"}</span>;
}
