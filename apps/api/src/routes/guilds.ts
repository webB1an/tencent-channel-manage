import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";
import { decrypt } from "../lib/encryption.js";
import { fetchChannels } from "../lib/tencentCli.js";

export async function guildRoutes(app: FastifyInstance) {
  app.get("/api/guilds", async (req) => {
    const { tokenId } = req.query as { tokenId?: string };
    const rows = await prisma.guild.findMany({
      where: { userId: req.user!.sub, ...(tokenId ? { tokenId } : {}) },
      include: { channels: true },
      orderBy: { cachedAt: "desc" },
    });
    return rows.map((g) => ({
      id: g.id,
      tokenId: g.tokenId,
      guildId: g.guildId,
      name: g.name,
      guildNumber: g.guildNumber,
      role: g.role,
      memberCount: g.memberCount,
      shareUrl: g.shareUrl,
      cachedAt: g.cachedAt.toISOString(),
      channels: g.channels.map((c) => ({
        id: c.id,
        guildId: c.guildId,
        channelId: c.channelId,
        name: c.name,
        type: c.type,
        cachedAt: c.cachedAt.toISOString(),
      })),
    }));
  });

  app.get("/api/channels", async (req) => {
    const { guildId } = req.query as { guildId?: string };
    const rows = await prisma.channel.findMany({
      where: {
        ...(guildId ? { guildId } : {}),
        guild: { userId: req.user!.sub },
      },
      orderBy: { cachedAt: "desc" },
    });
    return rows.map((c) => ({
      id: c.id,
      guildId: c.guildId,
      channelId: c.channelId,
      name: c.name,
      type: c.type,
      cachedAt: c.cachedAt.toISOString(),
    }));
  });

  app.post("/api/guilds/:id/sync-channels", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const guild = await prisma.guild.findFirst({
      where: { id, userId: req.user!.sub },
      include: { token: true },
    });
    if (!guild) return reply.code(404).send({ error: "not_found" });
    const result = await fetchChannels(decrypt(guild.token.encryptedToken), guild.guildId);
    if (!result.ok || !result.data) {
      return reply.code(400).send({ error: "sync_failed", message: result.error });
    }

    const channels = (result.data.channels ?? result.data.channel_list ?? [])
      .map((c) => ({
        channelId: String(c.channel_id ?? c.id ?? ""),
        name: String(c.channel_name ?? c.name ?? "未命名板块"),
        type: c.channel_type ?? c.type,
      }))
      .filter((c) => c.channelId);

    for (const channel of channels) {
      await prisma.channel.upsert({
        where: { guildId_channelId: { guildId: guild.id, channelId: channel.channelId } },
        update: {
          name: channel.name,
          type: channel.type == null ? null : String(channel.type),
          cachedAt: new Date(),
        },
        create: {
          guildId: guild.id,
          channelId: channel.channelId,
          name: channel.name,
          type: channel.type == null ? null : String(channel.type),
        },
      });
    }
    await prisma.auditLog.create({
      data: {
        userId: req.user!.sub,
        action: "guild.sync_channels",
        target: guild.id,
        metaJson: JSON.stringify({ count: channels.length }),
      },
    });
    return { ok: true, count: channels.length };
  });
}
