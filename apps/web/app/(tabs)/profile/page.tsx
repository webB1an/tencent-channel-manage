"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import type { ModelView, TokenView } from "@tcm/shared";

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
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage("Token 已保存并校验");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function syncGuilds(id: string) {
    setBusy(id);
    setMessage(null);
    try {
      const res = await api.syncGuilds(id);
      setMessage(`已同步 ${res.count} 个频道`);
    } catch (error) {
      setMessage((error as Error).message);
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
      setMessage("模型配置已保存");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function logout() {
    setToken(null);
    router.replace("/login");
  }

  return (
    <main className="px-5 pt-6">
      <h1 className="text-xl font-semibold text-ink">我的</h1>
      {message && <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand">{message}</p>}

      <section className="mt-5 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-medium text-ink">频道 Token</h2>
        <div className="mt-3 space-y-2">
          <input className="input" placeholder="备注名，如主号" value={label} onChange={(e) => setLabel(e.target.value)} />
          <textarea className="input min-h-24" placeholder="粘贴 connect.qq.com/ai 的 token" value={secret} onChange={(e) => setSecret(e.target.value)} />
          <button disabled={busy === "token"} onClick={addToken} className="tap w-full rounded-xl bg-brand py-2.5 text-sm text-white disabled:opacity-60">
            {busy === "token" ? "保存中..." : "保存并校验"}
          </button>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {tokens.map((t) => (
            <li key={t.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink">{t.label}</p>
                  <p className="text-xs text-ink-soft">尾号 ···{t.tokenTail}</p>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-[10px] " + (t.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
                  {t.status === "ACTIVE" ? "有效" : "失效"}
                </span>
              </div>
              <button disabled={busy === t.id} onClick={() => syncGuilds(t.id)} className="tap mt-2 rounded-full bg-paper px-3 py-1.5 text-xs text-ink disabled:opacity-60">
                {busy === t.id ? "同步中..." : "同步频道"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-2xl bg-white p-4 shadow-card">
        <h2 className="text-sm font-medium text-ink">模型配置</h2>
        <div className="mt-3 space-y-2">
          <input className="input" placeholder="Base URL" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          <input className="input" placeholder="Model，如 gpt-4o-mini" value={model} onChange={(e) => setModel(e.target.value)} />
          <input className="input" placeholder="API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <button disabled={busy === "model"} onClick={addModel} className="tap w-full rounded-xl bg-brand-soft py-2.5 text-sm text-brand disabled:opacity-60">
            {busy === "model" ? "保存中..." : "保存并测试"}
          </button>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {models.map((m) => (
            <li key={m.id} className="py-3 text-sm text-ink">
              <p>{m.model}</p>
              <p className="text-xs text-ink-soft">{m.baseUrl ?? "https://api.openai.com"}</p>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={logout} className="tap mt-6 w-full rounded-xl bg-rose-50 py-3 text-sm text-rose-500">
        退出登录
      </button>
    </main>
  );
}
