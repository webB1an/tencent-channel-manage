import type { FastifyInstance } from "fastify";
import { prisma } from "@tcm/db";
import { createModelSchema, ModelProvider } from "@tcm/shared";
import { decrypt, encrypt } from "../lib/encryption.js";

export async function modelRoutes(app: FastifyInstance) {
  app.get("/api/models", async (req) => {
    const rows = await prisma.modelConfig.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((m) => ({
      id: m.id,
      provider: m.provider as ModelProvider,
      model: m.model,
      baseUrl: m.baseUrl,
      lastTestedAt: m.lastTestedAt?.toISOString() ?? null,
      createdAt: m.createdAt.toISOString(),
    }));
  });

  app.post("/api/models", async (req, reply) => {
    const parsed = createModelSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "bad_request" });
    const { provider, model, baseUrl, apiKey } = parsed.data;
    const row = await prisma.modelConfig.create({
      data: {
        userId: req.user!.sub,
        provider,
        model,
        baseUrl: baseUrl ?? null,
        encryptedApiKey: encrypt(apiKey),
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "model.create", target: row.id },
    });
    return {
      id: row.id,
      provider: provider as ModelProvider,
      model,
      baseUrl: baseUrl ?? null,
    };
  });

  app.patch("/api/models/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.modelConfig.findFirst({ where: { id, userId: req.user!.sub } });
    if (!row) return reply.code(404).send({ error: "not_found" });
    const body = req.body as { provider?: string; model?: string; baseUrl?: string | null; apiKey?: string };
    const updated = await prisma.modelConfig.update({
      where: { id },
      data: {
        ...(body.provider ? { provider: body.provider } : {}),
        ...(body.model ? { model: body.model } : {}),
        ...(body.baseUrl !== undefined ? { baseUrl: body.baseUrl } : {}),
        ...(body.apiKey ? { encryptedApiKey: encrypt(body.apiKey) } : {}),
      },
    });
    await prisma.auditLog.create({
      data: { userId: req.user!.sub, action: "model.update", target: id },
    });
    return {
      id: updated.id,
      provider: updated.provider,
      model: updated.model,
      baseUrl: updated.baseUrl,
      lastTestedAt: updated.lastTestedAt?.toISOString() ?? null,
    };
  });

  app.post("/api/models/:id/test", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const row = await prisma.modelConfig.findFirst({ where: { id, userId: req.user!.sub } });
    if (!row) return reply.code(404).send({ error: "not_found" });
    const baseUrl = (row.baseUrl ?? (row.provider === "anthropic" ? "https://api.anthropic.com" : "https://api.openai.com")).replace(/\/$/, "");
    const apiKey = decrypt(row.encryptedApiKey);
    try {
      const res =
        row.provider === "anthropic"
          ? await fetch(`${baseUrl}/v1/messages`, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: row.model,
                max_tokens: 8,
                messages: [{ role: "user", content: "ping" }],
              }),
            })
          : await fetch(`${baseUrl}/v1/chat/completions`, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: row.model,
                messages: [{ role: "user", content: "ping" }],
                max_tokens: 8,
              }),
            });
      if (!res.ok) return reply.code(400).send({ error: "model_test_failed", status: res.status });
      const updated = await prisma.modelConfig.update({
        where: { id },
        data: { lastTestedAt: new Date() },
      });
      return { ok: true, lastTestedAt: updated.lastTestedAt?.toISOString() ?? null };
    } catch (error) {
      return reply.code(400).send({ error: "model_test_failed", message: (error as Error).message });
    }
  });

  app.delete("/api/models/:id", async (req) => {
    const id = (req.params as { id: string }).id;
    await prisma.modelConfig.deleteMany({
      where: { id, userId: req.user!.sub },
    });
    return { ok: true };
  });
}
