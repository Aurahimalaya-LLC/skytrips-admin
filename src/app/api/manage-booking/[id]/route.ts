import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error: Missing service role key" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("manage_booking")
      .update(body)
      .eq("uid", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating manage_booking:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Internal server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
