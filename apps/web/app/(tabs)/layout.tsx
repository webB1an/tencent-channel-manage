import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="page-enter">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
