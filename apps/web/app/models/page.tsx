"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { EmptyState, ModelRow, SectionHeader } from "@/components/patterns";
import { api } from "@/lib/api";
import type { ModelView } from "@tcm/shared";

type Provider = "openai" | "anthropic";

const providerOptions: Array<{ label: string; value: Provider }> = [
  { label: "OpenAI 兼容", value: "openai" },
  { label: "Anthropic 兼容", value: "anthropic" },
];

export default function ModelsPage() {
  const [models, setModels] = useState<ModelView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");

  const placeholder = useMemo(
    () =>
      provider === "anthropic"
        ? { baseUrl: "https://api.anthropic.com", model: "claude-3-5-sonnet-latest" }
        : { baseUrl: "https://api.openai.com", model: "gpt-4o-mini" },
    [provider],
  );

  const load = () =>
    api
      .listModels()
      .then(setModels)
      .catch((e) => Toast.show({ content: (e as Error).message, type: "error" }))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!model.trim() || !apiKey.trim()) {
      Toast.show({ content: "请填写 model 和 api_key", type: "error" });
      return;
    }
    setBusy(true);
    try {
      await api.createModel({
        provider,
        model: model.trim(),
        baseUrl: baseUrl.trim() || placeholder.baseUrl,
        apiKey: apiKey.trim(),
      });
      Toast.show({ content: "模型已保存", type: "success" });
      setApiKey("");
      setModel("");
      setBaseUrl("");
      await load();
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function test(id: string) {
    setTestingId(id);
    try {
      await api.testModel(id);
      Toast.show({ content: "模型测试通过", type: "success" });
      await load();
    } catch (e) {
      Toast.show({ content: (e as Error).message, type: "error" });
    } finally {
      setTestingId(null);
    }
  }

  return (
    <>
      <TopBar title="模型配置" />
      <main className="page-shell space-y-5">
        <Card padding="md" className="space-y-4">
          <header>
            <h2 className="font-display text-[16px] font-semibold text-ink">新增模型</h2>
            <p className="mt-1 text-[12px] text-ink-muted">支持 OpenAI 兼容和 Anthropic 兼容的 API 格式。</p>
          </header>

          <div className="space-y-3">
            <Select value={provider} onChange={setProvider} options={providerOptions} title="接口格式" />
            <Input
              label="base_url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={placeholder.baseUrl}
              prefix={<Icon name="server" size={16} />}
            />
            <Input
              label="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={placeholder.model}
              prefix={<Icon name="zap" size={16} />}
            />
            <Input
              label="api_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
              prefix={<Icon name="key" size={16} />}
            />
            <Button block size="lg" loading={busy} onClick={save}>
              <Icon name="check" size={16} />
              保存模型
            </Button>
          </div>
        </Card>

        <section>
          <SectionHeader title="已配置模型" count={loading ? undefined : `${models.length} 个`} />
          {loading ? (
            <div className="space-y-2">
              <Skeleton height={52} className="block rounded" />
              <Skeleton height={52} className="block rounded" />
            </div>
          ) : models.length === 0 ? (
            <EmptyState icon="zap" title="还没有模型" hint="配置后即可创建频道巡查任务" />
          ) : (
            <Card padding="none" className="overflow-hidden">
              {models.map((item) => (
                <ModelRow
                  key={item.id}
                  name={item.model}
                  provider={`${providerLabel(item.provider)}${item.baseUrl ? ` · ${item.baseUrl}` : ""}`}
                  status="enabled"
                  onClick={() => test(item.id)}
                />
              ))}
            </Card>
          )}
          {testingId && <p className="mt-2 text-center text-[12px] text-ink-muted">正在测试模型...</p>}
        </section>
      </main>
    </>
  );
}

function providerLabel(provider: string) {
  if (provider === "anthropic") return "Anthropic 兼容";
  if (provider === "openai") return "OpenAI 兼容";
  return provider;
}
