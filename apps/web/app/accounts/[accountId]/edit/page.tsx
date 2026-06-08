"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { TopBar } from "@/components/layout/top-bar";
import { FieldLabel, EmptyState } from "@/components/patterns";
import { accountService } from "@/lib/domain";

export default function EditAccountPage({ params }: { params: { accountId: string } }) {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const canSave = useMemo(() => Boolean(qq.trim()), [qq]);

  useEffect(() => {
    accountService.getAccountDetail(params.accountId)
      .then((a) => {
        if (!a) return;
        setQq(a.qq);
        setNickname(a.nickname || "");
        setRemark(a.remark || "");
        setLoaded(true);
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.accountId]);

  async function save() {
    if (!canSave) { Toast.show({ content: "请填写 QQ号", type: "error" }); return; }
    setBusy(true);
    try {
      await accountService.updateAccount(params.accountId, { qq, nickname, remark, ...(token.trim() ? { token: token.trim() } : {}) });
      Toast.show({ content: "账号已更新", type: "success" });
      router.replace(`/accounts/${params.accountId}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="编辑账号" />
      <main className="page-shell space-y-4">
        {loading ? (
          <Skeleton height={300} className="block" />
        ) : !loaded ? (
          <EmptyState title="账号不存在" hint="可能已被删除" />
        ) : (
          <>
            <section>
              <FieldLabel required>QQ号</FieldLabel>
              <Input value={qq} onChange={(e) => setQq(e.target.value)} placeholder="请输入 QQ号" />
            </section>
            <section>
              <FieldLabel>Token</FieldLabel>
              <Textarea value={token} onChange={(e) => setToken(e.target.value)} placeholder="留空则不修改,仅在需要更换时填写" rows={4} />
            </section>
            <section>
              <FieldLabel>昵称</FieldLabel>
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="方便识别账号,可不填" />
            </section>
            <section>
              <FieldLabel>备注</FieldLabel>
              <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="自定义备注,可不填" rows={3} />
            </section>
            <Button block size="lg" loading={busy} disabled={!canSave} onClick={save}>保存</Button>
          </>
        )}
      </main>
    </>
  );
}
