import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);
  const sortKey = searchParams.get("sortKey") || "agency_name";
  const sortDir = (searchParams.get("sortDir") || "asc") as "asc" | "desc";
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("agencies").select("*", { count: "exact" }).order(sortKey, { ascending: sortDir === "asc" }).range(from, to);
  if (q) {
    query = query.or(`agency_name.ilike.%${q}%,contact_person.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error, count } = await query;
  if (error) {
    console.error("Fetch agencies error:", error);
    if (error.code === '42703') { // Undefined column
      return NextResponse.json({ 
        error: "Database schema mismatch. Please run scripts/fix_agencies_schema.sql" 
      }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, page, pageSize, count });
}

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { agency_name, contact_person, number, iata_code, draft, contact_email, address_line1, address_line2, city, state, postal_code, country } = body || {};
  
  if (!agency_name || agency_name.trim() === "") {
    return NextResponse.json({ error: "Agency name is required" }, { status: 400 });
  }
  if (!contact_person || !number) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  
  const { data, error } = await supabase.from("agencies").insert([{
    agency_name,
    contact_person,
    number,
    contact_email,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    iata_code,
    status: "active",
    draft: !!draft
  }]).select("uid").maybeSingle();
  
  if (error || !data) {
    console.error("Create agency error:", error);
    if (error?.code === '42703') {
       return NextResponse.json({ error: "Schema mismatch: 'number' column missing" }, { status: 500 });
    }
    return NextResponse.json({ error: error?.message || "Insert failed" }, { status: 500 });
  }
  const uid = (data as { uid: string }).uid;
  return NextResponse.json({ ok: true, uid });
}
