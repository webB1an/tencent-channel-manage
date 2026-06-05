import "dotenv/config";

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
  cliPath: process.env.TENCENT_CHANNEL_CLI ?? (process.platform === "win32" ? "cmd.exe" : "npx"),
  cliPrefixArgs: process.env.TENCENT_CHANNEL_CLI
    ? []
    : process.platform === "win32"
      ? ["/d", "/s", "/c", "npx", "-y", "tencent-channel-cli"]
      : ["-y", "tencent-channel-cli"],
  runRoot: process.env.TENCENT_CHANNEL_RUN_ROOT ?? "./.runs",
  runTimeoutMs: Number(process.env.TENCENT_CHANNEL_RUN_TIMEOUT_MS ?? 5 * 60_000),
};
