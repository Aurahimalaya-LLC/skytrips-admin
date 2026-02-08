import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

// Helper to parse price strings like "$1,234.56" to numbers
const parsePrice = (price: string | number | undefined): number => {
  if (!price) return 0;
  if (typeof price === 'number') return price;
  return parseFloat(price.replace(/[^0-9.-]+/g, "")) || 0;
};

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });

  // 1. Fetch all agencies
  let query = supabase.from("agencies").select("uid, agency_name");

  // Try to apply filters but handle schema mismatch
  let { data: agencies, error: agenciesError } = await query.is("deleted_at", null);

  if (agenciesError && agenciesError.code === '42703') {
    // Fallback if deleted_at or status is missing
    const fallback = await supabase.from("agencies").select("uid, agency_name");
    agencies = fallback.data;
    agenciesError = fallback.error;
  }

  if (agenciesError || !agencies) {
    return NextResponse.json({ error: agenciesError?.message || "Failed to fetch agencies" }, { status: 500 });
  }

  // 2. Fetch all bookings
  // Optimization: In a real large-scale app, we would use a SQL view or RPC for aggregation.
  // For now, fetching columns needed for stats is acceptable given the likely scale.
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, buyingPrice, sellingPrice, paymentStatus, issuedthroughagency");

  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  const bookings = bookingsData || [];

  // 3. Aggregate stats
  let totalPartners = 0;
  let totalRevenue = 0; // Sum of CP (buyingPrice)
  let totalBookings = 0;
  let totalDueAmount = 0; // Sum of outstanding payments (sellingPrice where status != 'paid')

  totalPartners = agencies.length;
  totalBookings = bookings.length;

  totalRevenue = bookings.reduce((sum, b) => sum + parsePrice(b.buyingPrice), 0);

  // Calculate Total Due Amount
  // Assuming 'paid' status is case-insensitive 'paid'
  totalDueAmount = bookings.reduce((sum, b) => {
    const isPaid = (b.paymentStatus || "").toLowerCase() === "paid";
    if (!isPaid) {
      return sum + parsePrice(b.sellingPrice);
    }
    return sum;
  }, 0);

  return NextResponse.json({
    totalPartners,
    totalRevenue,
    totalBookings,
    totalDueAmount,
    activeBookings: totalBookings
  });
}
