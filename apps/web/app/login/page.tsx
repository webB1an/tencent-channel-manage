"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password) {
      Toast.show({ content: "请输入账号和密码", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const result = await api.login(username.trim(), password);
      setToken(result.token);
      Toast.show({ content: "登录成功", type: "success" });
      router.replace("/");
    } catch (err) {
      Toast.show({ content: (err as Error).message || "登录失败", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-5 py-8">
      <section className="space-y-6">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-white shadow-elev-1">
            <Icon name="shield-check" size={24} />
          </div>
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-tight text-ink">腾讯频道运营助手</h1>
            <p className="mt-2 text-[14px] text-ink-muted">登录后管理频道账号、巡检任务与执行记录。</p>
          </div>
        </div>

        <Card padding="md">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="账号"
              size="lg"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              prefix={<Icon name="user" size={17} />}
              placeholder="请输入账号"
            />
            <Input
              label="密码"
              size="lg"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<Icon name="lock" size={17} />}
              placeholder="请输入密码"
            />
            <Button block size="xl" type="submit" loading={loading}>
              登录
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
