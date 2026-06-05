/**
 * Bootstrap the admin user from env. Idempotent.
 *
 * Run with:  npm run db:seed   (which calls `tsx src/seed.ts`)
 */
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { prisma } from "./index.js";

loadEnv({ path: "../../.env" });

async function main(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn(
      "[seed] ADMIN_USERNAME / ADMIN_PASSWORD not set, skipping admin bootstrap",
    );
    return;
  }

  if (password.length < 8) {
    throw new Error(
      `[seed] ADMIN_PASSWORD must be at least 8 characters (got ${password.length})`,
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN", status: "ACTIVE" },
    create: {
      username,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
    select: { id: true, username: true, role: true, status: true },
  });

  console.log(
    `[seed] admin user ready: ${admin.username} (id=${admin.id}, role=${admin.role}, status=${admin.status})`,
  );
}

main()
  .catch((err) => {
    console.error("[seed] failed", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
