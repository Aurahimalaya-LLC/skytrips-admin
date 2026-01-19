import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getAdminClient } from "@/lib/supabase-server";
import { signSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  if (!email) return NextResponse.json({ ok: false, code: "missing_email", error: "Email is required" }, { status: 400 });
  if (!password) return NextResponse.json({ ok: false, code: "missing_password", error: "Password is required" }, { status: 400 });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmailValid) return NextResponse.json({ ok: false, code: "invalid_email", error: "Invalid email address format" }, { status: 400 });

  if (password.length < 8) return NextResponse.json({ ok: false, code: "weak_password", error: "Password must be at least 8 characters" }, { status: 400 });

  const { data: user, error } = await supabase
    .from("users")
    .select("id,email,first_name,last_name,role,is_active,password")
    .eq("email", email)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, code: "server_error", error: "Server error fetching account" }, { status: 500 });
  if (!user) return NextResponse.json({ ok: false, code: "email_not_found", error: "No account found for this email" }, { status: 404 });
  if (!user.is_active) return NextResponse.json({ ok: false, code: "account_disabled", error: "Account disabled. Contact your administrator." }, { status: 403 });

  const ok = await bcrypt.compare(password, user.password || "");
  if (!ok) return NextResponse.json({ ok: false, code: "incorrect_password", error: "Incorrect password" }, { status: 401 });

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const token = signSession({ id: user.id, email: user.email, role: user.role, name });
  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name } });
  setSessionCookie(res, token);
  return res;
}
