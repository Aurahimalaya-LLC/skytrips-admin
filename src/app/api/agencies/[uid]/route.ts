import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const { data, error } = await supabase.from("agencies").select("*").eq("uid", uid).maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message || "Not found" }, { status: 404 });
  const refs = await supabase.from("agency_booking_refs").select("booking_id").eq("agency_uid", uid);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fullBookings: any[] = [];
  if (refs.data && refs.data.length > 0) {
    const bookingIds = refs.data.map(r => r.booking_id);
    const bookingsRes = await supabase.from("bookings").select("*").in("id", bookingIds);
    fullBookings = bookingsRes.data || [];
  }

  return NextResponse.json({ 
    agency: data, 
    bookings: refs.data || [], 
    fullBookings: fullBookings,
    stats: { totalBookings: refs.data?.length || 0 } 
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const { agency_name, contact_person, number, iata_code, status, booking_ids, draft } = body || {};
  const { error } = await supabase.from("agencies").update({ agency_name, contact_person, number, iata_code, status, draft }).eq("uid", uid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (Array.isArray(booking_ids)) {
    await supabase.from("agency_booking_refs").delete().eq("agency_uid", uid);
    if (booking_ids.length > 0) {
      const rows = booking_ids.map((id: number) => ({ agency_uid: uid, booking_id: id }));
      const refRes = await supabase.from("agency_booking_refs").insert(rows);
      if (refRes.error) return NextResponse.json({ error: refRes.error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  const body = await req.json().catch(() => null);
  const mode = body?.mode || "soft";
  if (mode === "soft") {
    const { error } = await supabase.from("agencies").update({ status: "inactive", deleted_at: new Date().toISOString() }).eq("uid", uid);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const { error } = await supabase.from("agencies").delete().eq("uid", uid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
