import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: { uid: string } }) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const { data, error } = await supabase
    .from("agencies_versions")
    .select("*")
    .eq("agency_uid", params.uid)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
