import "dotenv/config";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "./routers";
import { parse as parseCookieHeader } from "cookie";
import { verifySessionToken } from "./_core/auth";
import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getUserByOpenId } from "./db";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const path = (req.query.trpc as string) || "";

  try {
    await nodeHTTPRequestHandler({
      router: appRouter,
      req,
      res,
      path,
      createContext: async () => {
        const user = await resolveUser(req);
        return { req, res, user } as any;
      },
      onError: ({ error, path }) => {
        console.error(`[tRPC] Error on ${path}:`, error.message);
      },
    });
  } catch (error: any) {
    console.error("Vercel Handler Crash:", error);
    res.status(500).json({
      error: "Vercel Handler Crash",
      message: error.message || String(error),
      stack: error.stack,
    });
  }
}
