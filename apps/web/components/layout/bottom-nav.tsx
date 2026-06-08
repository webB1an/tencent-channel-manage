"use client";

import { usePathname, useRouter } from "next/navigation";
import { TabBar } from "@/components/ui/tab-bar";
import { Icon } from "@/components/ui/icon";

const tabs = [
  { key: "/", label: "首页", icon: <Icon name="home" size={22} />, match: (p: string) => p === "/" },
  { key: "/tasks", label: "任务", icon: <Icon name="tasks" size={22} />, match: (p: string) => p?.startsWith("/tasks") },
  { key: "/mine", label: "我的", icon: <Icon name="profile" size={22} />, match: (p: string) => p?.startsWith("/mine") },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const activeKey = tabs.find((t) => t.match(pathname))?.key ?? "/";

  const items = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
  }));

  return (
    <TabBar
      activeKey={activeKey}
      items={items}
      onChange={(key) => router.push(key)}
    />
  );
}
