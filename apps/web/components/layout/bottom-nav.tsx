"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/components/ui/tab-bar";
import { Icon } from "@/components/ui/icon";

const tabs = [
  { key: "/", label: "首页", icon: <Icon name="home" size={20} />, match: (p: string) => p === "/" },
  { key: "/tasks", label: "任务中心", icon: <Icon name="tasks" size={20} />, match: (p: string) => p?.startsWith("/tasks") },
  { key: "/mine", label: "我的", icon: <Icon name="profile" size={20} />, match: (p: string) => p?.startsWith("/mine") },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const activeKey = tabs.find((t) => t.match(pathname))?.key ?? "/";
  return (
    <TabBar
      activeKey={activeKey}
      onChange={(k) => router.push(k)}
      items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
    />
  );
}
