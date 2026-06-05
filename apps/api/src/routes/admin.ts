import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tcm/db";

function requireAdmin(role?: string) {
  if (role !== "ADMIN") {
    const err = new Error("admin_required") as Error & { statusCode?: number };
    err.statusCode = 403;
    throw err;
  }
}

export async function adminRoutes(app: FastifyInstance) {
  app.get("/api/admin/users", async (req) => {
    requireAdmin(req.user?.role);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { tokens: true, tasks: true } },
      },
    });
    return users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
  });

  app.post("/api/admin/users", async (req, reply) => {
    requireAdmin(req.user?.role);
    const body = req.body as { username?: string; password?: string; role?: string };
    if (!body.username || !body.password || body.username.length < 3 || body.password.length < 8) {
      return reply.code(400).send({ error: "bad_request" });
    }
    const user = await prisma.user.create({
      data: {
        username: body.username,
        passwordHash: await bcrypt.hash(body.password, 10),
        role: body.role === "ADMIN" ? "ADMIN" : "USER",
        status: "ACTIVE",
      },
      select: { id: true, username: true, role: true, status: true, createdAt: true },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "admin.user_create", target: user.id },
    });
    return { ...user, createdAt: user.createdAt.toISOString() };
  });

  app.patch("/api/admin/users/:id", async (req, reply) => {
    requireAdmin(req.user?.role);
    const id = (req.params as { id: string }).id;
    const body = req.body as { status?: string; password?: string };
    if (id === req.user!.sub && body.status === "DISABLED") {
      return reply.code(400).send({ error: "cannot_disable_self" });
    }
    const data: { status?: string; passwordHash?: string } = {};
    if (body.status && ["ACTIVE", "DISABLED"].includes(body.status)) data.status = body.status;
    if (body.password) {
      if (body.password.length < 8) return reply.code(400).send({ error: "bad_password" });
      data.passwordHash = await bcrypt.hash(body.password, 10);
    }
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, role: true, status: true },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "admin.user_update", target: id },
    });
    return user;
  });
}
