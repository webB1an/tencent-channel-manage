"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, TextArea, Toast } from "antd-mobile";
import { accountService } from "@/lib/domain";
import { BottomActionBar, FieldLabel, PageHeader } from "@/components/business/Mobile";

export default function NewAccountPage() {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);
  const canSave = useMemo(() => qq.trim() && token.trim(), [qq, token]);

  async function save() {
    if (!canSave) {
      Toast.show({ content: "请填写 QQ号 和 Token" });
      return;
    }
    setBusy(true);
    try {
      await accountService.createAccount({ qq, token, nickname, remark });
      Toast.show({ content: "账号已保存" });
      router.replace("/");
    } catch (e) {
      Toast.show({ content: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-pad pb-28">
      <PageHeader title="新增账号" backHref="/" />
      <section className="surface rounded-lg p-4">
        <FieldLabel required>QQ号</FieldLabel>
        <Input value={qq} onChange={setQq} placeholder="请输入 QQ号" clearable />
        <div className="mt-4">
          <FieldLabel required>Token</FieldLabel>
          <TextArea value={token} onChange={setToken} placeholder="请输入 Token" rows={4} />
        </div>
        <div className="mt-4">
          <FieldLabel>昵称</FieldLabel>
          <Input value={nickname} onChange={setNickname} placeholder="方便识别账号，可不填" clearable />
        </div>
        <div className="mt-4">
          <FieldLabel>备注</FieldLabel>
          <TextArea value={remark} onChange={setRemark} placeholder="自定义备注，可不填" rows={3} />
        </div>
      </section>
      <BottomActionBar>
        <Button block color="primary" size="large" loading={busy} disabled={!canSave} onClick={save}>保存账号</Button>
      </BottomActionBar>
    </main>
  );
}
