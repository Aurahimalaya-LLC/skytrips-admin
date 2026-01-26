import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server config missing" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const email = String(searchParams.get("email") || "").trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("email, first_name, last_name, created_at")
    .eq("email", email)
    .single();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const handledBy =
    userData?.first_name && userData?.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData?.email || email;

  const { count: bookingCount, error: bookingsError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("handledBy", handledBy);

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  return NextResponse.json({
    totalBookings: bookingCount || 0,
    memberSince: userData?.created_at || null,
  });
}

