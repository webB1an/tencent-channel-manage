"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { StepIndicator, EmptyState } from "@/components/patterns";
import { accountService } from "@/lib/domain";

export default function EditAccountPage({ params }: { params: { accountId: string } }) {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const qqId = useId();
  const tokenId = useId();
  const nicknameId = useId();
  const remarkId = useId();
  const canSave = useMemo(() => Boolean(qq.trim()), [qq]);

  useEffect(() => {
    accountService
      .getAccountDetail(params.accountId)
      .then((a) => {
        if (!a) return;
        setQq(a.qq);
        setNickname(a.nickname || "");
        setRemark(a.remark || "");
      })
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));
  }, [params.accountId]);

  async function save() {
    if (!canSave) {
      Toast.show({ content: "请填写 QQ号", type: "error" });
      return;
    }
    setBusy(true);
    try {
      await accountService.updateAccount(params.accountId, {
        qq,
        nickname,
        remark,
        ...(token.trim() ? { token: token.trim() } : {}),
      });
      Toast.show({ content: "账号已更新", type: "success" });
      router.replace(`/accounts/${params.accountId}`);
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="编辑账号" />
        <main className="page-shell space-y-4">
          <Skeleton height={16} className="block" width={120} />
          <Skeleton height={300} className="block rounded-lg" />
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="编辑账号" />

      <main className="page-shell space-y-5">
        <section className="space-y-2">
          <StepIndicator current={1} total={1} variant="bar" />
          <p className="text-[12px] font-medium text-primary">修改账号信息</p>
        </section>

        <section className="rounded-lg border border-border bg-bg-card p-4">
          <header className="mb-4">
            <h2 className="font-display text-[16px] font-semibold text-ink">账号信息</h2>
            <p className="mt-1 text-[12px] text-ink-muted">修改后点击保存即可应用。</p>
          </header>

          <div className="space-y-4">
            <Input
              id={qqId}
              label="QQ 号"
              required
              value={qq}
              onChange={(e) => setQq(e.target.value)}
              placeholder="请输入 QQ号"
              prefix={<Icon name="user" size={16} />}
            />

            <Input
              id={tokenId}
              label="Token 密钥"
              optional
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="留空则不修改,仅在需要更换时填写"
              type={showToken ? "text" : "password"}
              prefix={<Icon name="key" size={16} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  aria-label={showToken ? "隐藏密钥" : "显示密钥"}
                  className="text-ink-muted hover:text-ink"
                >
                  <Icon name={showToken ? "eye-off" : "eye"} size={16} />
                </button>
              }
              hint="留空表示不修改原 Token"
            />

            <Input
              id={nicknameId}
              label="昵称"
              optional
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="方便识别账号,可不填"
              prefix={<Icon name="edit-2" size={16} />}
            />

            <Textarea
              id={remarkId}
              label="备注"
              optional
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="自定义备注,可不填"
              rows={3}
            />
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-phone border-t border-border bg-bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur">
        <Button block size="lg" loading={busy} onClick={save} className="shadow-primary">
          <Icon name="check" size={18} />
          保存修改
        </Button>
      </div>
    </>
  );
}
