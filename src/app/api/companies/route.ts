import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { CompanyProfile } from "@/types/company";

const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey || env.supabase.anonKey
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showDeleted = searchParams.get("showDeleted") === "true";
  const search = searchParams.get("search") || "";

  let query = supabaseAdmin.from("companies").select("*");

  if (!showDeleted) {
    query = query.is("deleted_at", null);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching companies:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const companies: CompanyProfile[] = (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    address: item.address,
    emails: item.emails || [],
    phones: item.phones || [],
    website: item.website,
    isHeadquarters: item.is_headquarters,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    deletedAt: item.deleted_at,
  }));

  return NextResponse.json(companies);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, emails, phones, website, isHeadquarters } = body;

    const { data, error } = await supabaseAdmin
      .from("companies")
      .insert([
        {
          name,
          address,
          emails,
          phones,
          website,
          is_headquarters: isHeadquarters,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating company:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const company: CompanyProfile = {
      id: data.id,
      name: data.name,
      address: data.address,
      emails: data.emails || [],
      phones: data.phones || [],
      website: data.website,
      isHeadquarters: data.is_headquarters,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    };

    return NextResponse.json(company);
  } catch (err: any) {
    console.error("Error in POST /api/companies:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
