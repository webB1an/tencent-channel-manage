"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-micro text-ink-3 tracking-[0.04em]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api.login(username, password);
      setToken(r.token);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("tcm_username", r.user.username);
      }
      router.replace("/home");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col px-7 pt-16 pb-12">
      <header>
        <h1 className="font-display text-d1 text-ink tracking-[0.06em]">TENCENT</h1>
        <p className="mt-2 text-micro text-ink-3 tracking-[0.18em]">CHANNELS · OPS</p>
      </header>

      <div className="mt-12 h-px w-8 bg-ink" />

      <h2 className="mt-6 text-h1 text-ink">频道运营工作台</h2>
      <p className="mt-1.5 text-body text-ink-2">用 AI 守好你的频道。</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <Field label="用户名">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            inputMode="text"
          />
        </Field>
        <Field label="密码">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {err && <p className="text-small text-risk-high">{err}</p>}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={busy}
        >
          登录
        </Button>
      </form>

      <p className={cn("mt-auto pt-10 text-micro text-ink-3 tracking-[0.04em]")}>v0.1 · 2026</p>
    </main>
  );
}
