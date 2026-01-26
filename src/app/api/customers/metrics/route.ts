import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

const parsePrice = (price: unknown): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (typeof price === "string") {
    const n = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

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

  const { data, error } = await supabase
    .from("bookings")
    .select("customerid, sellingPrice, sellingprice, created_at")
    .in("customerid", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const metrics: Record<
    string,
    { totalSpend: number; lastLogin: string | null }
  > = {};

  for (const id of ids) {
    metrics[id] = { totalSpend: 0, lastLogin: null };
  }

  for (const row of data || []) {
    const cid = String((row as any).customerid || "");
    if (!cid || !metrics[cid]) continue;

    const numeric =
      (row as any).sellingprice ?? (row as any).sellingPrice ?? (row as any).buyingPrice;
    metrics[cid].totalSpend += parsePrice(numeric);

    const ts = (row as any).created_at ? String((row as any).created_at) : "";
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

