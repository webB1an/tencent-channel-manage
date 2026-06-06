"use client";

import type { TokenView } from "@tcm/shared";
import { Badge } from "@/components/ui/Badge";

export interface TokenRowProps {
  token: TokenView;
  onSync: () => void;
  busy?: boolean;
}

export function TokenRow({ token, onSync, busy }: TokenRowProps) {
  return (
    <div className="py-3 border-t border-line first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-h3 text-ink">{token.label}</p>
          <p className="mt-0.5 text-micro text-ink-3">尾号 ···{token.tokenTail}</p>
        </div>
        <Badge tone={token.status === "ACTIVE" ? "riskLow" : "riskHigh"}>
          {token.status === "ACTIVE" ? "有效" : "失效"}
        </Badge>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={onSync}
          disabled={busy}
          className="tap h-7 px-2.5 rounded-sm text-mini text-ink-2 hover:bg-paper-2 disabled:opacity-60"
        >
          {busy ? "同步中..." : "同步频道"}
        </button>
      </div>
    </div>
  );
}
