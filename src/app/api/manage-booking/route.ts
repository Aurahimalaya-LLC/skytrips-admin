import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, booking, user_id, type, selected_travellers } = body;

    if (!uid || !booking || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server configuration missing" },
        { status: 500 },
      );
    }

    // Now we can safely insert with all columns as we defined them in migration
    const payload = {
      uid,
      booking_id: String(booking.id),
      user_id,
      type: type || "Refund",
      status: "Pending",
      booking_details: booking, // JSONB column
      amount: booking.sellingPrice || booking.buyingPrice || 0,
      reason: body.reason || "",
      selected_travellers: selected_travellers || [], // Storing selected travellers IDs
    };

    const { error } = await supabase.from("manage_booking").upsert([payload]);

    if (error) {
      console.error("Upsert manage_booking error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manage booking creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage || "Failed to create manage booking record" },
      { status: 500 },
    );
  }
}
