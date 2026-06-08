import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import dotenv from "dotenv";

function loadEnv() {
  let dir = process.cwd();
  while (true) {
    const envPath = join(dir, ".env");
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

loadEnv();

function need(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === "") throw new Error(`missing env: ${name}`);
  return v;
}

export const config = {
  encryptionKey: need("APP_ENCRYPTION_KEY", "0".repeat(64)),
  redisUrl: need("REDIS_URL", "redis://127.0.0.1:6379"),
  databaseUrl: need("DATABASE_URL", "file:../../data/app.db"),
  /// Path or executable name. The MVP invokes `tencent-channel-cli` with a
  /// JSON payload on stdin, see apps/worker/src/lib/cli.ts.
  cliPath: process.env.TENCENT_CHANNEL_CLI ?? (process.platform === "win32" ? "cmd.exe" : "npx"),
  cliPrefixArgs: process.env.TENCENT_CHANNEL_CLI
    ? []
    : process.platform === "win32"
      ? ["/d", "/s", "/c", "npx", "-y", "tencent-channel-cli"]
      : ["-y", "tencent-channel-cli"],
  /// Where to create per-invocation isolated working dirs.
  runRoot: process.env.TENCENT_CHANNEL_RUN_ROOT ?? "./.runs",
  /// Per-run timeout, ms.
  runTimeoutMs: Number(process.env.TENCENT_CHANNEL_RUN_TIMEOUT_MS ?? 5 * 60_000),
  nodeEnv: process.env.NODE_ENV ?? "development",
};
