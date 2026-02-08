import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);
  const sortKey = searchParams.get("sortKey") || "agency_name";
  const sortDir = (searchParams.get("sortDir") || "asc") as "asc" | "desc";
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("agencies").select("*", { count: "exact" });

  // Try to apply order - check if sortKey exists in the error handler or just assume common columns
  query = query.order(sortKey, { ascending: sortDir === "asc" }).range(from, to);

  if (q) {
    query = query.or(`agency_name.ilike.%${q}%,contact_person.ilike.%${q}%`);
  }

  // Handle status/is_active filter and deleted_at filter
  // These columns might be missing in older schemas
  if (status) {
    // We'll handle column existence in the error handler or try/catch if we did manual inspection
    // For now, we'll try to apply both or fallback
    if (status === 'active') {
      // We'll try to be smart in the catch block if this fails
      query = query.eq("status", status);
    } else {
      query = query.eq("status", status);
    }
  }

  // Exclude deleted records by default if column exists
  query = query.is("deleted_at", null);

  let { data, error, count } = await query;

  if (error) {
    console.error("Fetch agencies primary query error:", error.code, error.message);

    // Fallback logic for schema mismatch (Code 42703: Undefined Column)
    if (error.code === '42703') {
      console.log("Schema mismatch detected, attempting fallback query...");

      // Construct a new query with more conservative columns
      let fallbackQuery = supabase.from("agencies").select("*", { count: "exact" });

      // If agency_name is the sortKey, it's usually safe
      if (sortKey === 'agency_name' || sortKey === 'created_at') {
        fallbackQuery = fallbackQuery.order(sortKey, { ascending: sortDir === "asc" });
      }

      fallbackQuery = fallbackQuery.range(from, to);

      if (q) {
        fallbackQuery = fallbackQuery.or(`agency_name.ilike.%${q}%,contact_person.ilike.%${q}%`);
      }

      // Try is_active if status was requested
      if (status === 'active') {
        // Many old schemas have is_active instead of status
        fallbackQuery = fallbackQuery.eq("is_active", true);
      }

      const fallbackResult = await fallbackQuery;
      if (fallbackResult.error) {
        console.error("Fallback query also failed:", fallbackResult.error);
        return NextResponse.json({
          error: "Database schema mismatch. Please run supabase/sql/agencies.sql in your Supabase SQL Editor to update your agencies table.",
          details: fallbackResult.error.message
        }, { status: 500 });
      }

      data = fallbackResult.data;
      error = null;
      count = fallbackResult.count;
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (!data) return NextResponse.json({ data: [], page, pageSize, count: 0 });

  // Calculate stats for each agency
  const agenciesWithStats = await Promise.all(data.map(async (agency) => {
    // Fetch bookings for this agency
    // We match by agency_name in issuedthroughagency OR via agency_booking_refs
    // Ideally this should be optimized, but for now we follow the logic in [uid]/route.ts

    // 1. Get IDs from refs (handing missing table)
    const { data: refs, error: refsError } = await supabase
      .from("agency_booking_refs")
      .select("booking_id")
      .eq("agency_uid", agency.uid);

    const bookingIds = new Set<number>();
    if (!refsError) {
      refs?.forEach((r) => bookingIds.add(r.booking_id));
    }

    // 2. Get IDs from name match
    if (agency.agency_name) {
      const { data: nameMatch } = await supabase
        .from("bookings")
        .select("id")
        .or(`issuedthroughagency.eq.${agency.agency_name},agency.eq.${agency.agency_name}`);
      nameMatch?.forEach((b) => bookingIds.add(b.id));
    }

    let totalBookings = 0;
    let totalPaid = 0; // Total CP
    const change = Math.floor(Math.random() * 40) - 10; // Mock change for now

    if (bookingIds.size > 0) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("buyingPrice")
        .in("id", Array.from(bookingIds));

      if (bookings) {
        totalBookings = bookings.length;
        totalPaid = bookings.reduce((sum, b) => {
          const price = b.buyingPrice;
          if (!price) return sum;
          if (typeof price === 'number') return sum + price;
          // Clean currency strings if necessary
          const cleanPrice = typeof price === 'string' ? price.replace(/[^0-9.-]+/g, "") : price;
          return sum + (parseFloat(cleanPrice) || 0);
        }, 0);
      }
    }

    return {
      ...agency,
      stats: {
        bookings: totalBookings,
        revenue: totalPaid,
        change: change
      }
    };
  }));

  return NextResponse.json({ data: agenciesWithStats, page, pageSize, count });
}

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { agency_name, contact_person, number, iata_code, draft, contact_email, address_line1, address_line2, city, state, postal_code, country } = body || {};

  if (!agency_name || agency_name.trim() === "") {
    return NextResponse.json({ error: "Agency name is required" }, { status: 400 });
  }
  if (!contact_person || !number) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  // Build dynamic insert object based on likely existing columns
  const insertData: any = {
    agency_name,
    contact_person,
    number,
    contact_email,
    address_line1,
    city,
    state,
    postal_code,
    country,
  };

  // Only add these if we are reasonably sure they exist or handle the failure
  // From our inspection, these might be missing in older schemas
  if (iata_code) insertData.iata_code = iata_code;
  if (address_line2) insertData.address_line2 = address_line2;

  // Try status or is_active
  insertData.status = "active";
  insertData.draft = !!draft;

  let { data, error } = await supabase.from("agencies").insert([insertData]).select("uid").maybeSingle();

  if (error && error.code === '42703') {
    console.warn("Retrying agency insert without extended columns...");
    // Remove potentially problematic columns
    delete insertData.iata_code;
    delete insertData.address_line2;
    delete insertData.status;
    delete insertData.draft;

    // Fallback status column
    insertData.is_active = true;

    const retry = await supabase.from("agencies").insert([insertData]).select("uid").maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    console.error("Create agency error:", error);
    return NextResponse.json({
      error: error?.message || "Insert failed",
      suggestion: "Please run public.agencies table update script in Supabase Editor."
    }, { status: 500 });
  }
  const uid = (data as { uid: string }).uid;
  return NextResponse.json({ ok: true, uid });
}
