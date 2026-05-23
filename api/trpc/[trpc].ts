import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { parse as parseCookieHeader } from "cookie";
import { verifySessionToken } from "../../server/_core/auth";
import type { User } from "../../drizzle/schema";
import { ENV } from "../../server/_core/env";
import { getUserByOpenId } from "../../server/db";

async function resolveUser(req: VercelRequest): Promise<User | null> {
  const cookieHeader = req.headers.cookie || "";
  const cookies = parseCookieHeader(cookieHeader);
  const sessionCookie = cookies["app_session_id"];
  const session = await verifySessionToken(sessionCookie);
  if (!session) return null;

  try {
    const dbUser = await getUserByOpenId(session.openId);
    if (dbUser) return dbUser;
  } catch {
    // DB unavailable — fall back to JWT
  }

  if (session.openId === ENV.adminEmail) {
    return {
      id: 0,
      openId: session.openId,
      name: session.name,
      email: session.openId,
      loginMethod: "local",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;
  }
  return null;
}

// Build Express-compatible middleware once
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext: async ({ req, res }) => {
    const user = await resolveUser(req as any);
    return { req, res, user } as any;
  },
  onError: ({ error, path }) => {
    console.error(`[tRPC] Error on ${path}:`, error.message);
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Rewrite URL path so tRPC sees the correct procedure path
  // Vercel sends the full path like /api/trpc/products.list
  // tRPC middleware expects the path after /api/trpc/
  return trpcMiddleware(req as any, res as any, () => {
    res.status(404).json({ error: "Not found" });
  });
}
