import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();

    const supabaseAdmin = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey || env.supabase.anonKey
    );

    const { data, error } = await supabaseAdmin
      .from("media")
      .update(body)
      .eq("media_id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    const supabaseAdmin = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey || env.supabase.anonKey
    );

    // 1. Delete from Storage (if path provided)
    if (filePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("media")
        .remove([filePath]);
      
      if (storageError) {
        console.warn("Storage delete failed:", storageError);
        // Continue to delete from DB
      }
    }

    // 2. Delete from DB
    const { error } = await supabaseAdmin
      .from("media")
      .delete()
      .eq("media_id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
