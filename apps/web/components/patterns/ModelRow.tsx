import type { ModelView } from "@tcm/shared";

export interface ModelRowProps {
  model: ModelView;
}

export function ModelRow({ model: m }: ModelRowProps) {
  return (
    <div className="py-3 border-t border-line first:border-t-0">
      <p className="text-h3 text-ink">{m.model}</p>
      <p className="mt-0.5 text-micro text-ink-3">{m.baseUrl ?? "https://api.openai.com"}</p>
    </div>
  );
}
