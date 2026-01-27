import { getAdminClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No ids provided" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client configuration missing" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("airlines")
      .delete()
      .in("id", ids);

    if (error) {
      console.error("Error deleting airlines:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk delete API error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const ids: string[] = body.ids || [];
    const status: "Active" | "Inactive" | "Pending" | undefined = body.status;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No ids provided" },
        { status: 400 }
      );
    }

    if (!status || !["Active", "Inactive", "Pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client configuration missing" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("airlines")
      .update({ status })
      .in("id", ids);

    if (error) {
      console.error("Error updating airline statuses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk status API error:", error);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

