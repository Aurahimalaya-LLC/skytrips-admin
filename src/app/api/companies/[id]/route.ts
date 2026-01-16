import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { CompanyProfile } from "@/types/company";

const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey || env.supabase.anonKey
);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, address, emails, phones, website, isHeadquarters, deletedAt } = body;

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (emails !== undefined) updates.emails = emails;
    if (phones !== undefined) updates.phones = phones;
    if (website !== undefined) updates.website = website;
    if (isHeadquarters !== undefined) updates.is_headquarters = isHeadquarters;
    if (deletedAt !== undefined) updates.deleted_at = deletedAt;

    const { data, error } = await supabaseAdmin
      .from("companies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating company:", error);
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
    console.error("Error in PUT /api/companies/[id]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const hardDelete = searchParams.get("hard") === "true";

  if (hardDelete) {
    const { error } = await supabaseAdmin.from("companies").delete().eq("id", id);
    if (error) {
      console.error("Supabase error deleting company:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } else {
    const { data, error } = await supabaseAdmin
      .from("companies")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error soft-deleting company:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }
}
