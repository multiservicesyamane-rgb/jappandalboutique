import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import type { IncomingMessage } from "http";
import * as db from "../db";

const scryptAsync = promisify(scrypt);
const CUSTOMER_COOKIE = "cust_session";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function getSecret() {
  const s = process.env.JWT_SECRET || "jappandal-secret-jwt-2026-changez-moi";
  return new TextEncoder().encode(`cust:${s}`);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, key] = stored.split(":");
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(derived, Buffer.from(key, "hex"));
  } catch {
    return false;
  }
}

export async function createCustomerToken(customerId: number, phone: string, name: string) {
  return new SignJWT({ customerId, phone, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(getSecret());
}

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { customerId, phone, name } = payload as Record<string, unknown>;
    if (typeof customerId !== "number") return null;
    return { customerId: customerId as number, phone: String(phone || ""), name: String(name || "") };
  } catch {
    return null;
  }
}

export function getCustomerCookieHeader(token: string): string {
  const maxAge = Math.floor(ONE_YEAR_MS / 1000);
  return `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

export function clearCustomerCookieHeader(): string {
  return `${CUSTOMER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export async function authenticateCustomer(req: IncomingMessage) {
  const raw = req.headers["cookie"] || "";
  const cookies = parseCookies(raw);
  const token = cookies[CUSTOMER_COOKIE];
  if (!token) return null;
  const payload = await verifyCustomerToken(decodeURIComponent(token));
  if (!payload) return null;
  try {
    const customer = await db.getCustomerById(payload.customerId);
    return customer || null;
  } catch {
    return null;
  }
}
