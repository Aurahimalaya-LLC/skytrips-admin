import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { CompanyProfile } from "@/types/company";

const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey || env.supabase.anonKey
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return defaults if no settings found
    if (!data) {
      return NextResponse.json({
        company_name: "Curent",
        company_email: "",
        company_phone: "",
        currency: "USD",
        date_format: "MM/DD/YYYY",
        notifications: true,
        logo_url: "",
        favicon_url: "",
        company_profiles: []
      });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Fetch current companies from 'companies' table for snapshot
    const { data: companiesData, error: companiesError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (companiesError) {
      console.error("Error fetching companies for snapshot:", companiesError);
      return NextResponse.json({ error: companiesError.message }, { status: 500 });
    }

    // Map to CompanyProfile
    const companyProfiles: CompanyProfile[] = (companiesData || []).map((item: any) => ({
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
    
    // 2. Upsert settings with snapshot
    const { data: existing } = await supabaseAdmin
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const payload = { 
      ...body, 
      company_profiles: companyProfiles, // Save snapshot
      updated_at: new Date().toISOString() 
    };

    let result;
    if (existing) {
      result = await supabaseAdmin
        .from("settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      result = await supabaseAdmin
        .from("settings")
        .insert([payload])
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving settings:", result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err: any) {
    console.error("Error in POST /api/settings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
