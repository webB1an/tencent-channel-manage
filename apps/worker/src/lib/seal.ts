/// Thin re-export so the worker can decrypt without depending on the API
/// package. The actual AES-256-GCM helpers live in @tcm/db/crypto.
export { decrypt, tail } from "@tcm/db/crypto";
