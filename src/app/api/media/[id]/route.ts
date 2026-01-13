import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }
  const mediaId = (await params).id;

  try {
    const body = await request.json();
    const { title, alt_text, caption, description } = body;

    const { data, error } = await supabase
      .from("media")
      .update({
        title,
        alt_text,
        caption,
        description,
      })
      .eq("media_id", mediaId)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const mediaId = (await params).id;

  try {
    const { error } = await supabase
      .from("media")
      .delete()
      .eq("media_id", mediaId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
