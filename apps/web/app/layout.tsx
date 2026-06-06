import "./globals.css";
import { ToastHost } from "@/components/ui/toast";
import type { ReactNode } from "react";
import type { Viewport } from "next";

export const metadata = {
  title: "腾讯频道运营助手",
  description: "AI 辅助的频道运营工作台",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f2f4fb",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell mx-auto min-h-screen w-full max-w-[430px]">
          {children}
          <ToastHost />
        </div>
      </body>
    </html>
  );
}
