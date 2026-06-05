import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tcm/db";
import { loginSchema, UserRole } from "@tcm/shared";

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return reply.code(401).send({ error: "invalid_credentials" });
    if (user.status !== "ACTIVE") return reply.code(403).send({ error: "user_disabled" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: "invalid_credentials" });

    const token = await reply.jwtSign({
      sub: user.id,
      username: user.username,
      role: user.role as UserRole,
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "auth.login" },
    });

    return {
      token,
      user: { id: user.id, username: user.username, role: user.role as UserRole },
    };
  });

  app.get("/api/auth/me", async (req) => {
    return { user: req.user };
  });

  app.post("/api/auth/logout", async (req, reply) => {
    await prisma.auditLog.create({
      data: { userId: req.user?.sub, action: "auth.logout" },
    });
    reply.clearCookie("tcm_token");
    return { ok: true };
  });

  app.post("/api/auth/change-password", async (req, reply) => {
    const body = req.body as { oldPassword?: string; newPassword?: string };
    if (!body.oldPassword || !body.newPassword || body.newPassword.length < 8) {
      return reply.code(400).send({ error: "bad_request" });
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.sub } });
    const ok = await bcrypt.compare(body.oldPassword, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: "invalid_password" });
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(body.newPassword, 10) },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "auth.change_password" },
    });
    return { ok: true };
  });
}
