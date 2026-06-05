import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";

export async function auditRoutes(app: FastifyInstance) {
  app.get("/api/audit-logs", async (req) => {
    const rows = await prisma.auditLog.findMany({
      where: req.user!.role === "ADMIN" ? {} : { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      action: row.action,
      target: row.target,
      meta: JSON.parse(row.metaJson),
      createdAt: row.createdAt.toISOString(),
    }));
  });
}
