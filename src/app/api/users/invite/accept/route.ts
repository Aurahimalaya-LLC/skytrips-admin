import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || url.origin;
  if (!token) {
    return NextResponse.redirect(`${base}/?invite=missing_token`);
  }
  const payload = verifySession(token);
  if (!payload?.id || !payload.email) {
    return NextResponse.redirect(`${base}/?invite=invalid_token`);
  }
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.redirect(`${base}/?invite=server_config_missing`);
  }
  const { error } = await supabase
    .from("users")
    .update({ is_verified: true })
    .eq("id", payload.id)
    .eq("email", payload.email);
  if (error) {
    return NextResponse.redirect(`${base}/?invite=accept_failed`);
  }
  return NextResponse.redirect(`${base}/?invite=accepted`);
}
