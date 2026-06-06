"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import type { ModelView, TokenView } from "@tcm/shared";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TokenRow } from "@/components/patterns/TokenRow";
import { ModelRow } from "@/components/patterns/ModelRow";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenView[]>([]);
  const [models, setModels] = useState<ModelView[]>([]);
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    const [t, m] = await Promise.all([api.listTokens(), api.listModels()]);
    setTokens(t);
    setModels(m);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  async function addToken() {
    if (!label || !secret) return;
    setBusy("token");
    setMessage(null);
    try {
      const created = await api.createToken(label, secret);
      await api.checkToken(created.id);
      await refresh();
      setLabel("");
      setSecret("");
      setMessage({ kind: "ok", text: "Token 已保存并校验" });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function syncGuilds(id: string) {
    setBusy(id);
    setMessage(null);
    try {
      const res = await api.syncGuilds(id);
      setMessage({ kind: "ok", text: `已同步 ${res.count} 个频道` });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function addModel() {
    if (!model || !apiKey) return;
    setBusy("model");
    setMessage(null);
    try {
      const created = await api.createModel({ provider: "custom", model, baseUrl, apiKey });
      await api.testModel(created.id).catch(() => undefined);
      await refresh();
      setModel("");
      setApiKey("");
      setMessage({ kind: "ok", text: "模型配置已保存" });
    } catch (e) {
      setMessage({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  function logout() {
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("tcm_username");
    }
    router.replace("/login");
  }

  return (
    <main className="px-5 pt-8 pb-12">
      <header>
        <h1 className="text-d2 text-ink">我的</h1>
        <p className="mt-1 text-body text-ink-2 font-mono">admin</p>
        <div className="mt-5 h-px w-8 bg-ink" />
      </header>

      {message && (
        <p
          className={cn(
            "mt-5 rounded-md px-3 py-2 text-small",
            message.kind === "ok" ? "bg-lime text-lime-ink" : "bg-risk-high/10 text-risk-high",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="mt-7">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">账户</h2>
        </div>
        <button
          onClick={logout}
          className="tap mt-3 w-full h-12 rounded-lg border border-line bg-paper text-small text-risk-high flex items-center justify-between px-4 hover:bg-risk-high/5"
        >
          <span>退出登录</span>
          <span aria-hidden>→</span>
        </button>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">频道 Token</h2>
          <span className="text-micro text-ink-3">· {tokens.length}</span>
        </div>
        <Card pad="md" className="mt-3 space-y-2">
          <Input placeholder="备注名，如主号" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Textarea
            placeholder="粘贴 connect.qq.com/ai 的 token"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            rows={4}
            className="min-h-24"
          />
          <Button variant="primary" size="md" fullWidth onClick={addToken} loading={busy === "token"} disabled={!label || !secret}>
            保存并校验
          </Button>
        </Card>
        {tokens.length > 0 && (
          <Card pad="md" className="mt-3">
            {tokens.map((t) => (
              <TokenRow key={t.id} token={t} onSync={() => syncGuilds(t.id)} busy={busy === t.id} />
            ))}
          </Card>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-h2 text-ink">模型配置</h2>
          <span className="text-micro text-ink-3">· {models.length}</span>
        </div>
        <Card pad="md" className="mt-3 space-y-2">
          <Input placeholder="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          <Input placeholder="Model，如 gpt-4o-mini" value={model} onChange={(e) => setModel(e.target.value)} />
          <Input placeholder="API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Button variant="primary" size="md" fullWidth onClick={addModel} loading={busy === "model"} disabled={!model || !apiKey}>
            保存并测试
          </Button>
        </Card>
        {models.length > 0 && (
          <Card pad="md" className="mt-3">
            {models.map((m) => (
              <ModelRow key={m.id} model={m} />
            ))}
          </Card>
        )}
      </section>
    </main>
  );
}
