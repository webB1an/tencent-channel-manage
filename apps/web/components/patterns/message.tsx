import { cn } from "@/lib/cn";

export function Message({ kind, children }: { kind: "ok" | "err"; children: React.ReactNode }) {
  return <p className={cn("rounded-md px-3 py-2 text-sm", kind === "ok" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger")}>{children}</p>;
}
