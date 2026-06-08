"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { StepIndicator } from "@/components/patterns";
import { accountService } from "@/lib/domain";

export default function NewAccountPage() {
  const router = useRouter();
  const [qq, setQq] = useState("");
  const [token, setToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const qqId = useId();
  const tokenId = useId();
  const nicknameId = useId();
  const remarkId = useId();
  const canSave = useMemo(() => qq.trim() && token.trim(), [qq, token]);

  async function save() {
    if (!canSave) {
      Toast.show({ content: "请填写 QQ号 和 Token", type: "error" });
      return;
    }
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
      <TopBar title="新增账号" actions={[{ icon: <Icon name="more-vertical" size={20} />, onClick: () => Toast.show({ content: "更多操作" }), label: "更多" }]} />

      <main className="page-shell space-y-5">
        {/* Step progress */}
        <section className="space-y-2">
          <StepIndicator current={1} total={3} variant="bar" />
          <p className="text-[12px] font-medium text-primary">第 1/3 步</p>
        </section>

        {/* Form card */}
        <section className="rounded-lg border border-border bg-bg-card p-4">
          <header className="mb-4">
            <h2 className="font-display text-[16px] font-semibold text-ink">账号信息</h2>
            <p className="mt-1 text-[12px] text-ink-muted">请填写您的账户连接信息以开始同步。</p>
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
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="请输入访问密钥"
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
            />

            {/* Security note */}
            <div className="flex items-start gap-2 rounded border border-info/30 bg-info-soft p-3 text-[12px] text-info">
              <Icon name="info" size={14} className="mt-0.5 flex-shrink-0" />
              <p>Token 用于 API 访问的身份凭证,您可以在控制台的「设置-开发者选项」中获取。请务必妥善保管。</p>
            </div>

            <Input
              id={nicknameId}
              label="昵称"
              optional
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例如: 主账号"
              prefix={<Icon name="edit-2" size={16} />}
            />

            <Textarea
              id={remarkId}
              label="备注"
              optional
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="填写账号相关说明"
              rows={3}
            />
          </div>
        </section>

        {/* Security callout */}
        <section className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary to-primary-container p-4 text-white">
          <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 100% 50%, rgba(255,255,255,0.4), transparent 60%)" }} />
          <div className="absolute right-3 top-3 text-white/30">
            <Icon name="shield-check" size={40} />
          </div>
          <div className="relative">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              SECURE SYNC
            </p>
            <h3 className="mt-1 font-display text-[16px] font-semibold">全加密数据传输</h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/80">
              您的所有账号数据将在本地加密后再上传至安全网关,确保隐私安全。
            </p>
          </div>
        </section>
      </main>

      {/* Fixed bottom action */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-phone border-t border-border bg-bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur">
        <Button block size="lg" loading={busy} disabled={!canSave} onClick={save} className="shadow-primary">
          <Icon name="check" size={18} />
          保存账号
        </Button>
      </div>
    </>
  );
}
