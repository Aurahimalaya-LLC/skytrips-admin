import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    
    let query = supabase
      .from("media")
      .select("*, media_tags(tag_name), media_categories(category_name)")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (type && type !== "all") {
      query = query.eq("mime_type", type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // Transform to standard format
    const formattedData = data.map((item: any) => ({
      ...item,
      tags: item.media_tags?.map((t: any) => t.tag_name) || [],
      categories: item.media_categories?.map((c: any) => c.category_name) || [],
      url: supabase.storage.from("media").getPublicUrl(item.file_path).data.publicUrl
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Note: File uploads are typically better handled client-side with Supabase Storage to avoid server limits,
  // but we can implement metadata creation here.
  try {
    const body = await request.json();
    const { title, file_path, mime_type, file_size, uploaded_by } = body;

    const { data, error } = await supabase
      .from("media")
      .insert({
        title,
        file_path,
        mime_type,
        file_size,
        uploaded_by
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
