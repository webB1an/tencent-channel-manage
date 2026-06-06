import { BottomNav } from "@/components/layout/bottom-nav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-shell">{children}</div>
      <BottomNav />
    </>
  );
}
