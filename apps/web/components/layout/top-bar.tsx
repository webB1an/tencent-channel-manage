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
