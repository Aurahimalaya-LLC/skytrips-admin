import { NextResponse } from "next/server";
import { getTokenFromCookieHeader, verifySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || undefined;
  const token = getTokenFromCookieHeader(cookieHeader);
  const session = verifySession(token);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, user: { id: session.id, email: session.email, role: session.role, name: session.name } });
}
