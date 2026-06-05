"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/home", label: "首页", icon: HomeIcon },
  { href: "/tasks", label: "任务", icon: TaskIcon },
  { href: "/results", label: "结果", icon: ResultIcon },
  { href: "/profile", label: "我的", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 mx-auto max-w-[480px] border-t border-slate-200 bg-white"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="tap flex flex-col items-center justify-center gap-0.5 py-2.5"
                aria-current={active ? "page" : undefined}
              >
                <Icon className={active ? "text-brand" : "text-slate-400"} />
                <span
                  className={
                    "text-[11px] " + (active ? "text-brand font-medium" : "text-slate-400")
                  }
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function TaskIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ResultIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20V8m6 12V4m6 16v-7m4 7H4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ProfileIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
