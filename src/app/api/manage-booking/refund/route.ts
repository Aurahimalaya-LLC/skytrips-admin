import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const bookingId = String(body?.bookingId || "");
    const uid = String(body?.uid || "");
    const amount = body?.amount ?? null;

    if (!bookingId || !uid) {
      return NextResponse.json(
        { error: "bookingId and uid are required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server configuration missing" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("manage_booking")
      .insert([{ uid, booking_id: bookingId }]);

    if (error) {
      console.error("refund_api_insert_error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: error.message || "Insert failed" },
        { status: 500 }
      );
    }

    console.log("refund_api_confirmed", {
      bookingId,
      uid,
      amount,
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("refund_api_exception", { message: e instanceof Error ? e.message : e });
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
