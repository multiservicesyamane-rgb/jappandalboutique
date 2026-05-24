import type { CookieOptions, Request } from "express";
import type { ServerResponse } from "node:http";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function buildSetCookieHeader(
  name: string,
  value: string,
  opts: { httpOnly?: boolean; path?: string; sameSite?: string; secure?: boolean; maxAge?: number }
): string {
  let header = `${name}=${encodeURIComponent(value)}`;
  if (opts.path) header += `; Path=${opts.path}`;
  if (opts.maxAge !== undefined) header += `; Max-Age=${Math.floor(opts.maxAge / 1000)}`;
  if (opts.httpOnly) header += "; HttpOnly";
  if (opts.secure) header += "; Secure";
  if (opts.sameSite) header += `; SameSite=${opts.sameSite}`;
  return header;
}

export function setSessionCookie(res: ServerResponse, req: Request, name: string, token: string, maxAgeMs: number) {
  const opts = getSessionCookieOptions(req);
  const header = buildSetCookieHeader(name, token, { ...opts, sameSite: String(opts.sameSite ?? "lax"), maxAge: maxAgeMs });
  res.setHeader("Set-Cookie", header);
}

export function clearSessionCookie(res: ServerResponse, req: Request, name: string) {
  const opts = getSessionCookieOptions(req);
  const header = buildSetCookieHeader(name, "", { ...opts, sameSite: String(opts.sameSite ?? "lax"), maxAge: 0 });
  res.setHeader("Set-Cookie", header);
}

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: isSecure ? "none" : "lax",
    secure: isSecure,
  };
}
