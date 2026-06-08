"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { FieldLabel } from "@/components/patterns";
import { accountService } from "@/lib/domain";

export default function NewAccountPage() {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);
  const qqId = useId();
  const tokenId = useId();
  const nicknameId = useId();
  const remarkId = useId();
  const canSave = useMemo(() => qq.trim() && token.trim(), [qq, token]);

  async function save() {
    if (!canSave) { Toast.show({ content: "请填写 QQ号 和 Token", type: "error" }); return; }
    setBusy(true);
    try {
      await accountService.createAccount({ qq, token, nickname, remark });
      Toast.show({ content: "账号已保存", type: "success" });
      router.replace("/");
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="新增账号" />
      <main className="page-shell space-y-4">
        <section>
          <FieldLabel htmlFor={qqId} required>QQ号</FieldLabel>
          <Input id={qqId} value={qq} onChange={(e) => setQq(e.target.value)} placeholder="请输入 QQ号" />
        </section>
        <section>
          <FieldLabel htmlFor={tokenId} required>Token</FieldLabel>
          <Textarea id={tokenId} value={token} onChange={(e) => setToken(e.target.value)} placeholder="请输入 Token" rows={4} />
        </section>
        <section>
          <FieldLabel htmlFor={nicknameId}>昵称</FieldLabel>
          <Input id={nicknameId} value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="方便识别账号,可不填" />
        </section>
        <section>
          <FieldLabel htmlFor={remarkId}>备注</FieldLabel>
          <Textarea id={remarkId} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="自定义备注,可不填" rows={3} />
        </section>
        <Button block size="lg" loading={busy} disabled={!canSave} onClick={save}>保存账号</Button>
      </main>
    </>
  );
}
