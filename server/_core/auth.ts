import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

type SessionPayload = {
  openId: string;
  name: string;
};

function getSecretKey() {
  const secret = ENV.cookieSecret || "change-this-secret-in-production";
  return new TextEncoder().encode(secret);
}

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

export async function createSessionToken(openId: string, name: string): Promise<string> {
  const secretKey = getSecretKey();
  const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    const { openId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || !openId) return null;
    return { openId, name: String(name || "") };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await verifySessionToken(sessionCookie);
  if (!session) return null;
  try {
    const dbUser = await db.getUserByOpenId(session.openId);
    if (dbUser) return dbUser;
  } catch {
    // DB unavailable — fall back to JWT-derived identity
  }
  // Synthetic user built from verified JWT (admin only)
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

export function verifyAdminCredentials(email: string, password: string): boolean {
  if (!ENV.adminEmail || !ENV.adminPassword) return false;
  return email === ENV.adminEmail && password === ENV.adminPassword;
}
