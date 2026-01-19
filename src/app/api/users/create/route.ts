import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const email = String(body?.email || "").trim();
  const first_name = String(body?.first_name || "");
  const last_name = String(body?.last_name || "");
  const role = String(body?.role || "agent");
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const exists = await supabase.from("users").select("id", { count: "exact" }).eq("email", email);
  if (exists.error) return NextResponse.json({ error: exists.error.message }, { status: 500 });
  if ((exists.count || 0) > 0) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const readable_password = process.env.NEXT_PUBLIC_ADMIN_DEFAULT_PASSWORD || "Skytrips@123";
  const password = await bcrypt.hash(readable_password, 10);
  const id = crypto.randomUUID();

  const ins = await supabase
    .from("users")
    .insert([{ id, email, first_name, last_name, role, is_active: true, is_verified: false, readable_password, password }]);
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}
