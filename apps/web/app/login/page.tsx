"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api.login(username, password);
      setToken(r.token);
      router.replace("/home");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-6 pt-20">
      <h1 className="text-2xl font-semibold text-ink">登录</h1>
      <p className="mt-1 text-sm text-ink-soft">使用你的频道运营账号登录</p>

      <form onSubmit={submit} className="mt-10 space-y-4">
        <label className="block">
          <span className="text-xs text-ink-soft">用户名</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-brand"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            inputMode="text"
          />
        </label>
        <label className="block">
          <span className="text-xs text-ink-soft">密码</span>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-brand"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <button
          type="submit"
          disabled={busy}
          className="tap w-full rounded-xl bg-brand px-4 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {busy ? "登录中..." : "登录"}
        </button>
      </form>
    </main>
  );
}
