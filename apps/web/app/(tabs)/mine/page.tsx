"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { PageHeader } from "@/components/patterns";

export default function MinePage() {
  const [confirmClear, setConfirmClear] = useState(false);

  function clearCache() {
    localStorage.removeItem("tcm_disabled_task_ids");
    setConfirmClear(false);
    Toast.show({ content: "缓存已清理", type: "success" });
  }

  return (
    <>
      <PageHeader title="我的" />

      <Card padding="md" className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-primary-soft text-primary">
          <Icon name="profile" size={24} />
        </span>
        <div>
          <h2 className="text-xl text-text">运营用户</h2>
          <p className="text-sm text-text-3">登录后查看更多信息</p>
        </div>
      </Card>

      <section className="mt-4 overflow-hidden rounded-lg border border-border bg-bg-card">
        <ListRow title="使用说明" onClick={() => Toast.show({ content: "使用说明待接入" })} />
        <ListRow title="Token 获取说明" onClick={() => Toast.show({ content: "Token 获取说明待接入" })} />
        <ListRow title="系统设置" onClick={() => Toast.show({ content: "系统设置待接入" })} />
        <ListRow title="清理缓存" onClick={() => setConfirmClear(true)} />
        <ListRow title="关于项目" onClick={() => Toast.show({ content: "关于项目待接入" })} />
      </section>

      <Dialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="清理本地缓存"
        content="将清除本地禁用任务配置,确认继续？"
        actions={
          <>
            <Button block variant="secondary" onClick={() => setConfirmClear(false)}>取消</Button>
            <Button block onClick={clearCache}>确认</Button>
          </>
        }
      />
    </>
  );
}
