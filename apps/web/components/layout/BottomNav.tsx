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
