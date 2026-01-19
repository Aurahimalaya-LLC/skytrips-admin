import crypto from "crypto";
import type { NextResponse } from "next/server";

type SessionPayload = {
  id: string;
  email: string;
  role?: string;
  name?: string;
  iat: number;
  exp: number;
};

const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "skytrips-auth";
const DEFAULT_TTL_SECONDS = Number(process.env.NEXT_PUBLIC_AUTH_COOKIE_MAX_AGE) || 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.NEXT_PUBLIC_AUTH_ADMIN_SESSION_SECRET || "dev-secret";
}

function hmac(data: string) {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function signSession(payload: Omit<SessionPayload, "iat" | "exp">, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const fullPayload: SessionPayload = { ...payload, iat, exp };
  const json = JSON.stringify(fullPayload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = hmac(b64);
  return `${b64}.${sig}`;
}

export function verifySession(token?: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  const expected = hmac(b64);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEFAULT_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getTokenFromCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(`${COOKIE_NAME}=`)) {
      return p.slice(COOKIE_NAME.length + 1);
    }
  }
  return undefined;
}
