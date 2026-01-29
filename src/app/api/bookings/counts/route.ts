import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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

  // Get count of bookings WITHOUT customer link
  // Unlinked if: (customerid is null OR empty) AND (customer is null OR empty object {})
  const { count: withoutCustomerCount, error: withoutCustomerError } =
    await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .or(
        "customerid.is.null,customerid.eq.00000000-0000-0000-0000-000000000000",
      )
      .or("customer.is.null,customer.eq.{}");

  if (withoutCustomerError) {
    return NextResponse.json(
      { error: withoutCustomerError.message },
      { status: 500 },
    );
  }

  const withCustomerCount = Math.max(
    0,
    (totalCount || 0) - (withoutCustomerCount || 0),
  );

  return NextResponse.json({
    withCustomerCount: withCustomerCount || 0,
    withoutCustomerCount: withoutCustomerCount || 0,
  });
}
