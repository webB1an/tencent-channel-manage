import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config.js";
import type { JwtPayload } from "@tcm/shared";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

export async function authPreHandler(req: FastifyRequest) {
  try {
    await req.jwtVerify();
    const payload = req.user;
    if (!payload?.sub) throw new Error("bad token");
  } catch {
    const err = new Error("unauthorized") as Error & { statusCode?: number };
    err.statusCode = 401;
    throw err;
  }
}

export async function registerAuth(app: FastifyInstance) {
  await app.register(import("@fastify/cookie"));
  await app.register(import("@fastify/jwt"), {
    secret: config.jwtSecret,
    sign: { expiresIn: config.jwtTtl },
    cookie: { cookieName: "tcm_token", signed: false },
  });

  app.addHook("onRequest", async (req) => {
    if (req.url.startsWith("/api/auth/")) return;
    if (!req.url.startsWith("/api/")) return;
    await authPreHandler(req);
  });
}
