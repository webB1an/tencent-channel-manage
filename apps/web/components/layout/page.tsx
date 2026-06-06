import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn("page-shell", className)}>{children}</main>;
}
