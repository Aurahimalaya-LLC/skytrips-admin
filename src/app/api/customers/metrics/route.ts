import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";
import { calculateItineraryMileage } from "@/lib/mileage";
import { FlightItinerary } from "@/types";

const parsePrice = (price: unknown): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (typeof price === "string") {
    const n = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

interface BookingRow {
  customerid: string | number | null;
  customer: { id?: string } | null;
  sellingPrice: number | string | null;
  sellingprice: number | string | null;
  buyingPrice: number | string | null;
  created_at: string | null;
  itineraries: FlightItinerary[] | null;
}

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server config missing" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids)
    ? body.ids.map((v: unknown) => String(v)).filter(Boolean)
    : [];

  if (ids.length === 0) {
    return NextResponse.json({ metrics: {} });
  }

  // Optimized query to fetch only relevant bookings
  // We check both the customerid column and the id inside the customer JSONB object
  const { data: dataByJson, error: errorByJson } = await supabase
    .from("bookings")
    .select("customerid, customer, sellingPrice, sellingprice, buyingPrice, created_at, itineraries")
    .or(`customerid.in.(${ids.join(",")}),customer->>id.in.(${ids.join(",")})`);
    
  if (errorByJson) {
    console.error("Error fetching bookings for metrics:", errorByJson);
    return NextResponse.json({ error: errorByJson.message }, { status: 500 });
  }

  const metrics: Record<
    string,
    { totalSpend: number; lastLogin: string | null; totalMiles: number }
  > = {};

  for (const id of ids) {
    metrics[id] = { totalSpend: 0, lastLogin: null, totalMiles: 0 };
  }

  const idSet = new Set(ids);

  for (const r of dataByJson || []) {
    const row = r as unknown as BookingRow;
    
    // Get the effective customer ID
    const cidFromCol = row.customerid ? String(row.customerid) : null;
    const cidFromJson = row.customer?.id ? String(row.customer.id) : null;
    const cid = cidFromCol || cidFromJson;
    
    if (!cid || !idSet.has(cid)) continue;

    const numeric =
      row.sellingprice ?? row.sellingPrice ?? row.buyingPrice;
    metrics[cid].totalSpend += parsePrice(numeric);

    // Calculate mileage
    const itineraries = row.itineraries;
    if (itineraries && Array.isArray(itineraries)) {
      metrics[cid].totalMiles += calculateItineraryMileage(itineraries, "miles");
    }

    const ts = row.created_at ? String(row.created_at) : "";
    if (!ts) continue;
    if (!metrics[cid].lastLogin) {
      metrics[cid].lastLogin = ts;
      continue;
    }
    if (new Date(ts).getTime() > new Date(metrics[cid].lastLogin as string).getTime()) {
      metrics[cid].lastLogin = ts;
    }
  }

  return NextResponse.json({ metrics });
}

