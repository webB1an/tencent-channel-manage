"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "antd-mobile";

const tabs = [
  { href: "/", label: "首页", icon: HomeIcon },
  { href: "/tasks", label: "任务中心", icon: TaskIcon },
  { href: "/mine", label: "我的", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-line bg-paper-2/95 shadow-[0_-10px_28px_-24px_rgb(15_23_42/0.45)] backdrop-blur"
      style={{ height: 78, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="主导航"
    >
      <TabBar
        activeKey={pathname === "/" ? "/" : tabs.find((t) => t.href !== "/" && pathname?.startsWith(t.href))?.href ?? "/"}
        onChange={(key) => router.push(key)}
        safeArea
        className="h-full"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          return <TabBar.Item key={t.href} title={t.label} icon={(active) => <Icon className={active ? "text-accent" : "text-ink-3"} />} />;
        })}
      </TabBar>
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
function ProfileIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
