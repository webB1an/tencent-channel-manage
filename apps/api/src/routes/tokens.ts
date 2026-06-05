import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";
import { createTokenSchema, TokenStatus } from "@tcm/shared";
import { decrypt, encrypt, tail } from "../lib/encryption.js";
import { checkToken, fetchGuilds } from "../lib/tencentCli.js";

export async function tokenRoutes(app: FastifyInstance) {
  app.get("/api/tokens", async (req) => {
    const rows = await prisma.channelToken.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((t) => ({
      id: t.id,
      label: t.label,
      tokenTail: t.tokenTail,
      status: t.status as TokenStatus,
      lastCheckedAt: t.lastCheckedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    }));
  });

  app.post("/api/tokens", async (req, reply) => {
    const parsed = createTokenSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    const { label, secret } = parsed.data;
    const row = await prisma.channelToken.create({
      data: {
        userId: req.user!.sub,
        label,
        encryptedToken: encrypt(secret),
        tokenTail: tail(secret),
        status: "ACTIVE",
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "token.create", target: row.id },
    });
    return { id: row.id, label: row.label, tokenTail: row.tokenTail };
  });

  app.post("/api/tokens/:id/check", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.channelToken.findFirst({ where: { id, userId: req.user!.sub } });
    if (!row) return reply.code(404).send({ error: "not_found" });
    const result = await checkToken(decrypt(row.encryptedToken));
    const status = result.ok ? "ACTIVE" : "INVALID";
    const updated = await prisma.channelToken.update({
      where: { id },
      data: { status, lastCheckedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: "token.check",
        target: id,
        metaJson: JSON.stringify({ ok: result.ok, error: result.ok ? null : result.error }),
      },
    });
    return {
      ok: result.ok,
      status: updated.status,
      message: result.ok ? "token_valid" : result.error,
      lastCheckedAt: updated.lastCheckedAt?.toISOString() ?? null,
    };
  });

  app.post("/api/tokens/:id/sync-guilds", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.channelToken.findFirst({ where: { id, userId: req.user!.sub } });
    if (!row) return reply.code(404).send({ error: "not_found" });
    const result = await fetchGuilds(decrypt(row.encryptedToken));
    if (!result.ok || !result.data) {
      await prisma.channelToken.update({
        where: { id },
        data: { status: "INVALID", lastCheckedAt: new Date() },
      });
      return reply.code(400).send({ error: "token_invalid", message: result.error });
    }

    const groups = [
      ...(result.data.created_guilds ?? []),
      ...(result.data.managed_guilds ?? []),
      ...(result.data.joined_guilds ?? []),
    ].filter((g) => g.guild_id && g.name);

    for (const guild of groups) {
      await prisma.guild.upsert({
        where: { tokenId_guildId: { tokenId: id, guildId: guild.guild_id! } },
        update: {
          name: guild.name!,
          guildNumber: guild.guild_number ?? null,
          role: guild.role ?? null,
          memberCount: guild.member_count ?? null,
          shareUrl: guild.share_url ?? null,
          cachedAt: new Date(),
        },
        create: {
          userId: req.user!.sub,
          tokenId: id,
          guildId: guild.guild_id!,
          name: guild.name!,
          guildNumber: guild.guild_number ?? null,
          role: guild.role ?? null,
          memberCount: guild.member_count ?? null,
          shareUrl: guild.share_url ?? null,
        },
      });
    }

    await prisma.channelToken.update({
      where: { id },
      data: { status: "ACTIVE", lastCheckedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: "token.sync_guilds",
        target: id,
        metaJson: JSON.stringify({ count: groups.length }),
      },
    });
    return { ok: true, count: groups.length };
  });

  app.delete("/api/tokens/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.channelToken.findFirst({
      where: { id, userId: req.user!.sub },
    });
    if (!row) return reply.code(404).send({ error: "not_found" });
    await prisma.channelToken.update({
      where: { id },
      data: { status: "REVOKED" },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "token.revoke", target: id },
    });
    return { ok: true };
  });
}
