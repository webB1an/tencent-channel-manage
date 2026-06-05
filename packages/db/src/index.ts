import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __tcmPrisma: PrismaClient | undefined;
}

/**
 * Apply SQLite connection-level optimizations. Safe to call multiple times;
 * a module-level promise memoises the work so subsequent imports are no-ops.
 *
 * - `journal_mode = WAL`        allows concurrent readers with a single writer.
 * - `busy_timeout = 5000`       makes writers wait 5s on lock contention
 *                               instead of failing immediately.
 * - `synchronous = NORMAL`      good durability/perf trade-off under WAL.
 * - `foreign_keys = ON`         SQLite disables FK enforcement by default
 *                               per connection; we want cascade deletes to work.
 */
let pragmasApplied: Promise<void> | null = null;

export function applySqlitePragmas(client: PrismaClient): Promise<void> {
  if (pragmasApplied) return pragmasApplied;
  pragmasApplied = (async () => {
    try {
      await client.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
      await client.$queryRawUnsafe("PRAGMA busy_timeout = 5000;");
      await client.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
      await client.$queryRawUnsafe("PRAGMA foreign_keys = ON;");
    } catch (err) {
      pragmasApplied = null;
      console.warn("[db] failed to apply SQLite pragmas", err);
    }
  })();
  return pragmasApplied;
}

function createClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
  // Fire-and-forget; the next query will queue on the same connection.
  void applySqlitePragmas(client);
  return client;
}

export const prisma: PrismaClient =
  globalThis.__tcmPrisma ?? (globalThis.__tcmPrisma = createClient());

if (process.env.NODE_ENV !== "production") {
  globalThis.__tcmPrisma = prisma;
}

export * from "@prisma/client";
