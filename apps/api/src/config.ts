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
  if (v === undefined || v === "") {
    throw new Error(`missing env: ${name}`);
  }
  return v;
}

export const config = {
  port: Number(process.env.APP_PORT ?? 4000),
  jwtSecret: need("APP_JWT_SECRET", "dev-insecure-secret-change-me"),
  jwtTtl: process.env.APP_JWT_TTL ?? "7d",
  encryptionKey: need("APP_ENCRYPTION_KEY", "0".repeat(64)),
  redisUrl: need("REDIS_URL", "redis://127.0.0.1:6379"),
  databaseUrl: need("DATABASE_URL", "file:../../data/app.db"),
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "change-me-now",
  nodeEnv: process.env.NODE_ENV ?? "development",
  cliPath: process.env.TENCENT_CHANNEL_CLI ?? "npx",
  cliPrefixArgs: process.env.TENCENT_CHANNEL_CLI
    ? []
    : ["-y", "tencent-channel-cli"],
  runRoot: process.env.TENCENT_CHANNEL_RUN_ROOT ?? "./.runs",
  runTimeoutMs: Number(process.env.TENCENT_CHANNEL_RUN_TIMEOUT_MS ?? 5 * 60_000),
};
