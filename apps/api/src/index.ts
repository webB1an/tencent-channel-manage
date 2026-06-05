import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { registerAuth } from "./lib/auth.js";
import { authRoutes } from "./routes/auth.js";
import { tokenRoutes } from "./routes/tokens.js";
import { modelRoutes } from "./routes/models.js";
import { taskRoutes } from "./routes/tasks.js";
import { resultRoutes } from "./routes/results.js";
import { guildRoutes } from "./routes/guilds.js";
import { adminRoutes } from "./routes/admin.js";
import { auditRoutes } from "./routes/audit.js";

async function build() {
  const app = Fastify({ logger: { level: config.nodeEnv === "production" ? "info" : "debug" } });

  await app.register(cors, { origin: true, credentials: true });
  await registerAuth(app);

  app.get("/health", async () => ({ ok: true, ts: Date.now() }));

  await app.register(authRoutes);
  await app.register(tokenRoutes);
  await app.register(modelRoutes);
  await app.register(taskRoutes);
  await app.register(resultRoutes);
  await app.register(guildRoutes);
  await app.register(adminRoutes);
  await app.register(auditRoutes);

  return app;
}

build()
  .then(async (app) => {
    const addr = await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`api listening on ${addr}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
