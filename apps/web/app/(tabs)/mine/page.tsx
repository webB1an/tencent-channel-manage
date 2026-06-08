"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { SectionHeader, StatTile } from "@/components/patterns";

export default function MinePage() {
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  function clearCache() {
    localStorage.removeItem("tcm_disabled_task_ids");
    setConfirmClear(false);
    Toast.show({ content: "缓存已清理", type: "success" });
  }

  return (
    <>
      <TopBar
        title="我的"
        actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多" }), label: "更多" }]}
      />

      <main className="page-shell space-y-4">
        {/* User card */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-semibold text-[20px] font-display">
              A
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-[17px] font-semibold text-ink">Admin_User</h2>
                <span className="rounded-sm border border-success/30 bg-success-soft px-2 py-0.5 text-[10px] font-bold tracking-wider text-success">
                  NORMAL
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[12px] text-ink-muted">ID: 952748103</p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-t border-border pt-3 text-center">
            <div className="px-1">
              <p className="font-display text-[22px] font-semibold tabular text-ink">24</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">今日任务</p>
            </div>
            <div className="px-1">
              <p className="font-display text-[22px] font-semibold tabular text-ink">156</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">已完成</p>
            </div>
            <div className="px-1">
              <p className="font-display text-[22px] font-semibold tabular text-success">99%</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">在线率</p>
            </div>
          </div>
        </Card>

        {/* Help section */}
        <section>
          <Card padding="none" className="overflow-hidden">
            <ListRow
              prefix={<Icon name="book-open" size={18} />}
              title="使用说明"
              onClick={() => Toast.show({ content: "使用说明" })}
            />
            <ListRow
              prefix={<Icon name="key" size={18} />}
              title="Token 获取说明"
              onClick={() => Toast.show({ content: "Token 获取说明" })}
            />
          </Card>
        </section>

        {/* Settings section */}
        <section>
          <Card padding="none" className="overflow-hidden">
            <ListRow
              prefix={<Icon name="settings" size={18} />}
              title="系统设置"
              onClick={() => Toast.show({ content: "系统设置" })}
            />
            <ListRow
              prefix={<Icon name="trash" size={18} />}
              title="清理缓存"
              description="128 MB"
              onClick={() => setConfirmClear(true)}
            />
            <ListRow
              prefix={<Icon name="info" size={18} />}
              title="关于项目"
              description="v2.4.0"
              onClick={() => Toast.show({ content: "腾讯频道运营助手 v2.4.0" })}
            />
          </Card>
        </section>

        {/* Logout */}
        <Button block variant="outlined" size="lg" onClick={() => setConfirmLogout(true)}>
          <Icon name="log-out" size={18} />
          退出登录
        </Button>
      </main>

      <Dialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="清理本地缓存"
        content="将清除本地禁用任务配置,确认继续？"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmClear(false)}>
              取消
            </Button>
            <Button block variant="danger" onClick={clearCache}>
              确认清理
            </Button>
          </>
        }
      />

      <Dialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="退出登录"
        content="退出登录后将清除本地账号信息,确认继续？"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmLogout(false)}>
              取消
            </Button>
            <Button block variant="danger" onClick={() => { setConfirmLogout(false); Toast.show({ content: "已退出登录", type: "success" }); }}>
              确认退出
            </Button>
          </>
        }
      />
    </>
  );
}
