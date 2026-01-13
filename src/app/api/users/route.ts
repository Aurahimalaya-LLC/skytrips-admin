import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact" })
    .or(`username.ilike.%${q}%,email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
    .range(from, to)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, page, pageSize });
}

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { email, password, username, first_name, last_name, phone, role, status } = body || {};
  if (!email || !password || !username) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const authRes = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (authRes.error || !authRes.data.user) return NextResponse.json({ error: authRes.error?.message || "Auth create failed" }, { status: 500 });
  const userId = authRes.data.user.id;
  const { error } = await supabase.from("user_profiles").insert([{ id: userId, email, username, first_name, last_name, phone, role: role || "user", status: status || "active" }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: userId });
}

export async function PUT(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { id, username, first_name, last_name, phone, role, status } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabase.from("user_profiles").update({ username, first_name, last_name, phone, role, status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { id, password, status } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (password) {
    const res = await supabase.auth.admin.updateUserById(id, { password });
    if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  }
  if (status) {
    const { error } = await supabase.from("user_profiles").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { id, mode } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (mode === "soft") {
    const { error } = await supabase.from("user_profiles").update({ deleted_at: new Date().toISOString(), status: "deleted" }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  if (mode === "deactivate") {
    const { error } = await supabase.from("user_profiles").update({ status: "inactive" }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const delAuth = await supabase.auth.admin.deleteUser(id);
  if (delAuth.error) return NextResponse.json({ error: delAuth.error.message }, { status: 500 });
  const { error } = await supabase.from("user_profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
