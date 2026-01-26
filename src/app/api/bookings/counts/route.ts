import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server config missing" },
      { status: 500 },
    );
  }

  const { count: totalCount, error: totalError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true });

  if (totalError) {
    return NextResponse.json({ error: totalError.message }, { status: 500 });
  }

  const { count: withCustomerCount, error: withCustomerError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .not("customerid", "is", null)
    .neq("customerid", "00000000-0000-0000-0000-000000000000");

  if (withCustomerError) {
    return NextResponse.json({ error: withCustomerError.message }, { status: 500 });
  }

  const withoutCustomerCount = Math.max(
    0,
    (totalCount || 0) - (withCustomerCount || 0),
  );

  return NextResponse.json({
    withCustomerCount: withCustomerCount || 0,
    withoutCustomerCount,
  });
}
