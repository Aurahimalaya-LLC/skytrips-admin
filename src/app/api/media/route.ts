import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    const supabaseAdmin = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey || env.supabase.anonKey
    );

    let query = supabaseAdmin
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (type && type !== "all") {
      query = query.eq("mime_type", type);
    }

    // Category filtering might need adjustment based on schema (e.g., if it's a relation)
    // For now, assuming simple filtering or we filter in memory if complex
    
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Enrich data with public URLs if needed
    const enrichedData = data.map((item) => {
      // Ensure we don't double-encode or malform the path
      // storage.from('media').getPublicUrl(path) expects the path relative to the bucket
      const publicUrl = supabaseAdmin.storage.from("media").getPublicUrl(item.file_path).data.publicUrl;
      
      // Trim any potential whitespace from the URL
      const cleanUrl = publicUrl.trim();
      
      return {
        ...item,
        url: cleanUrl
      };
    });

    return NextResponse.json(enrichedData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.file_path || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey || env.supabase.anonKey
    );

    const { data, error } = await supabaseAdmin
      .from("media")
      .insert({
        title: body.title,
        file_path: body.file_path,
        mime_type: body.mime_type,
        file_size: body.file_size,
        uploaded_by: body.uploaded_by,
        width: body.width,
        height: body.height,
        duration: body.duration,
        alt_text: body.alt_text,
        caption: body.caption
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const publicUrl = supabaseAdmin.storage.from("media").getPublicUrl(data.file_path).data.publicUrl;

    return NextResponse.json({
      ...data,
      url: publicUrl
    });

  } catch (error: any) {
    console.error("Media create error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
