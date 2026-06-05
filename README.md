# 腾讯频道运营助手

Mobile H5 monorepo for operating Tencent Channels with AI-assisted workflows.

## Layout

```
apps/
  web/        Next.js (mobile H5, App Router)
  api/        Fastify API
  worker/     BullMQ worker (tencent-channel-cli runner)
packages/
  db/         Prisma + SQLite
  shared/     Types, zod schemas, queue names
```

## Quick start

1. `cp .env.example .env` and fill values
2. `npm install`
3. `npm run db:generate && npm run db:migrate && npm run db:seed`
4. `npm run dev:api`  (terminal 1)
5. `npm run dev:worker` (terminal 2)
6. `npm run dev:web`  (terminal 3) → open on phone via LAN IP

Bootstrap admin is created from `ADMIN_USERNAME` / `ADMIN_PASSWORD` on first migration.

## Security notes

- Token and model API keys are encrypted at rest with `APP_ENCRYPTION_KEY` (AES-256-GCM).
- The worker never logs decrypted tokens; the CLI helper injects them via `QQ_AI_CONNECT_DOTENV` only into the per-invocation child environment.
- Each CLI invocation runs with its own `USERPROFILE` / `HOME` to avoid polluting global state.
- Users only see their own tokens / models / tasks / results — all API routes scope by `userId`.
- Queue jobs carry a per-token group key so the same token is serialized; concurrent jobs on the same token wait.
