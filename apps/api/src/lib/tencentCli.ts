import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { config } from "../config.js";

const TAIL_BYTES = 16 * 1024;

export interface TencentGuild {
  guild_id?: string;
  guild_number?: string;
  name?: string;
  role?: string;
  member_count?: number;
  share_url?: string;
}

export interface TencentChannel {
  channel_id?: string;
  id?: string;
  channel_name?: string;
  name?: string;
  channel_type?: number | string;
  type?: number | string;
}

export async function runCliJson<T>(token: string, args: string[]) {
  const runRoot = resolve(config.runRoot);
  await mkdir(runRoot, { recursive: true });
  const workDir = await mkdtemp(join(runRoot, "api-"));
  const profileDir = join(workDir, "profile");
  const dotenvPath = join(workDir, "qq-ai-connect.env");
  try {
    await mkdir(profileDir, { recursive: true });
    await writeFile(dotenvPath, `QQ_AI_CONNECT_TOKEN=${token}\n`, { mode: 0o600 });
    const cli = cliInvocation([...args, "--json"]);
    const child = spawn(cli.command, cli.args, {
      cwd: workDir,
      env: {
        ...minimalEnv(),
        QQ_AI_CONNECT_DOTENV: dotenvPath,
        USERPROFILE: profileDir,
        HOME: profileDir,
        TMP: tmpdir(),
        TEMP: tmpdir(),
        TMPDIR: tmpdir(),
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (b: Buffer) => stdout.push(b));
    child.stderr.on("data", (b: Buffer) => stderr.push(b));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }, config.runTimeoutMs);

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
    });
    clearTimeout(timer);

    const stdoutTail = scrub(tail(stdout), token, dotenvPath);
    const stderrTail = scrub(tail(stderr), token, dotenvPath);
    let parsed: { success?: boolean; data?: T; error?: { message?: string } } | null = null;
    try {
      parsed = JSON.parse(stdoutTail.trim());
    } catch {
      parsed = null;
    }
    const ok = !timedOut && child.exitCode === 0 && parsed?.success !== false;
    return {
      ok,
      data: parsed?.data ?? null,
      error: parsed?.error?.message ?? (stderrTail || stdoutTail),
      exitCode: child.exitCode ?? -1,
      timedOut,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function checkToken(token: string) {
  return runCliJson<{ valid?: boolean; message?: string; tokenSource?: string }>(token, ["login", "status"]);
}

export async function fetchGuilds(token: string) {
  return runCliJson<{
    created_guilds?: TencentGuild[] | null;
    managed_guilds?: TencentGuild[] | null;
    joined_guilds?: TencentGuild[] | null;
  }>(token, ["manage", "get-my-join-guild-info"]);
}

export async function fetchChannels(token: string, guildId: string) {
  return runCliJson<{ channels?: TencentChannel[]; channel_list?: TencentChannel[] }>(
    token,
    ["manage", "get-guild-channel-list", "--guild-id", guildId],
  );
}

function tail(chunks: Buffer[]) {
  const raw = Buffer.concat(chunks);
  return (raw.length > TAIL_BYTES ? raw.subarray(raw.length - TAIL_BYTES) : raw).toString("utf8");
}

function scrub(text: string, token: string, dotenvPath: string) {
  return text.split(token).join("<redacted-token>").split(dotenvPath).join("<redacted-dotenv>");
}

function cliInvocation(args: string[]) {
  const argv = [config.cliPath, ...config.cliPrefixArgs, ...args];
  if (process.platform !== "win32") {
    return { command: config.cliPath, args: [...config.cliPrefixArgs, ...args] };
  }
  return {
    command: "cmd.exe",
    args: ["/d", "/c", argv.map(escapeCmdArg).join(" ")],
  };
}

function escapeCmdArg(value: string) {
  return value
    .replace(/\^/g, "^^")
    .replace(/%/g, "%%")
    .replace(/&/g, "^&")
    .replace(/\|/g, "^|")
    .replace(/</g, "^<")
    .replace(/>/g, "^>")
    .replace(/\(/g, "^(")
    .replace(/\)/g, "^)");
}

function minimalEnv(): NodeJS.ProcessEnv {
  const drop = new Set([
    "APP_ENCRYPTION_KEY",
    "APP_JWT_SECRET",
    "DATABASE_URL",
    "REDIS_URL",
    "QQ_AI_CONNECT_TOKEN",
    "QQ_AI_CONNECT_DOTENV",
  ]);
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined || drop.has(key)) continue;
    env[key] = value;
  }
  return env;
}
