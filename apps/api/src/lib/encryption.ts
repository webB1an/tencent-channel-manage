/// Re-export the shared AES-256-GCM helpers and the tail helper. The actual
/// implementation lives in @tcm/db so the worker can decrypt with the same
/// key without depending on the API package.
export { encrypt, decrypt, tail } from "@tcm/db/crypto";
