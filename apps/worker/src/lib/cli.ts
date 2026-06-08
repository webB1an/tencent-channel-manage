import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { config } from "../config.js";

const TAIL_BYTES = 16 * 1024;

export interface CliResult<T = unknown> {
  ok: boolean;
  data: T | null;
  stdoutTail: string;
  stderrTail: string;
  exitCode: number;
  timedOut: boolean;
}

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

export interface TencentFeed {
  feed_id?: string;
  id?: string;
  title?: string;
  content?: string;
  plainTxt?: string;
  plain_txt?: string;
  summary?: string;
  author?: { nick?: string; nickname?: string; tiny_id?: string; tinyid?: string };
  author_nick?: string;
  author_id?: string;
  postUser?: { nick?: string; nickname?: string; tinyid?: string };
  like_count?: number;
  likeCount?: number;
  total_comment_count?: number;
  comment_count?: number;
  commentCount?: number;
  create_time?: number | string;
  createTime?: number | string;
  create_time_raw?: number | string;
  channel_id?: string;
}

function tailBuffer(chunks: Buffer[]): string {
  const raw = Buffer.concat(chunks);
  const slice = raw.length > TAIL_BYTES ? raw.subarray(raw.length - TAIL_BYTES) : raw;
  return slice.toString("utf8");
}

function scrub(text: string, token: string, dotenvPath: string): string {
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

export async function runCliJson<T>(
  token: string,
  args: string[],
  stdinJson?: unknown,
): Promise<CliResult<T>> {
  const runRoot = resolve(config.runRoot);
  await mkdir(runRoot, { recursive: true });
  const workDir = await mkdtemp(join(runRoot, "run-"));
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
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on("data", (b: Buffer) => stdoutChunks.push(b));
    child.stderr.on("data", (b: Buffer) => stderrChunks.push(b));

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
    }, config.runTimeoutMs);

    await new Promise<void>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", () => resolve());
      if (stdinJson !== undefined) {
        child.stdin.write(JSON.stringify(stdinJson));
      }
      child.stdin.end();
    });
    clearTimeout(timer);

    const stdoutTail = scrub(tailBuffer(stdoutChunks), token, dotenvPath);
    const stderrTail = scrub(tailBuffer(stderrChunks), token, dotenvPath);
    const exitCode = child.exitCode ?? -1;
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(stdoutTail.trim());
    } catch {
      parsed = null;
    }
    const envelope = parsed as { success?: boolean; data?: T; error?: unknown } | null;
    const ok = exitCode === 0 && envelope?.success !== false && !timedOut;

    return {
      ok,
      data: envelope && "data" in envelope ? (envelope.data as T) : (parsed as T | null),
      stdoutTail,
      stderrTail,
      exitCode,
      timedOut,
    };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export async function checkToken(token: string) {
  return runCliJson<{ valid?: boolean; message?: string; tokenSource?: string }>(token, ["login", "status"]);
}

export async function getMyGuilds(token: string) {
  return runCliJson<{
    created_guilds?: TencentGuild[] | null;
    managed_guilds?: TencentGuild[] | null;
    joined_guilds?: TencentGuild[] | null;
    total_count?: number;
  }>(token, ["manage", "get-my-join-guild-info"]);
}

export async function getGuildChannels(token: string, guildId: string) {
  return runCliJson<{ channels?: TencentChannel[]; channel_list?: TencentChannel[] }>(
    token,
    ["manage", "get-guild-channel-list", "--guild-id", guildId],
  );
}

export async function getChannelFeeds(
  token: string,
  guildId: string,
  channelId: string,
  count: number,
  attachInfo?: string,
) {
  const args = [
    "feed",
    "get-channel-timeline-feeds",
    "--guild-id",
    guildId,
    "--channel-id",
    channelId,
    "--count",
    String(count),
  ];
  if (attachInfo) args.push("--feed-attach-info", attachInfo);
  return runCliJson<{ feeds?: TencentFeed[]; data?: TencentFeed[]; feed_attach_info?: string; feed_attch_info?: string }>(
    token,
    args,
  );
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
