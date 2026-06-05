/**
 * AES-256-GCM symmetric encryption for at-rest secrets.
 *
 * The plaintext token / API key is encrypted with a key derived from the
 * `APP_ENCRYPTION_KEY` env var. The key may be supplied as either base64
 * (preferred, 32 bytes) or hex (32 bytes). Output is a base64 string with
 * the layout: [12-byte IV][16-byte auth tag][ciphertext].
 *
 * The key is memoised at module load — rotation requires a process restart.
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCMTypes,
} from "node:crypto";

const ALGORITHM: CipherGCMTypes = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let cachedKey: Buffer | null = null;

function loadKey(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("APP_ENCRYPTION_KEY is not set");
  }
  // Try base64 first (the documented format in .env.example).
  const base64Buf = Buffer.from(raw, "base64");
  if (base64Buf.length === KEY_LENGTH) {
    cachedKey = base64Buf;
    return cachedKey;
  }
  // Fall back to hex.
  const hexBuf = Buffer.from(raw, "hex");
  if (hexBuf.length === KEY_LENGTH) {
    cachedKey = hexBuf;
    return cachedKey;
  }
  throw new Error(
    `APP_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (base64 or hex); got base64=${base64Buf.length} hex=${hexBuf.length}`,
  );
}

export function encrypt(plaintext: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const key = loadKey();
  const data = Buffer.from(payload, "base64");
  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("ciphertext too short");
  }
  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Extract the last `n` characters of a secret for at-rest display. The
 * caller must never store the full secret alongside this.
 */
export function tail(secret: string, n = 4): string {
  if (secret.length <= n) return secret;
  return secret.slice(-n);
}
