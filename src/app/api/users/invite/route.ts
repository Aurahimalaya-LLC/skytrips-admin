import { NextResponse } from "next/server";
import { sendWelcomeUser } from "@/lib/mail";
import { getAdminClient } from "@/lib/supabase-server";
import { signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim();
    const fullName = String(body?.fullName || "");
    const role = String(body?.role || "");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let acceptUrl = "";
    const supabase = getAdminClient();
    if (supabase) {
      const { data: userRecord } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (userRecord?.id) {
        const token = signSession({ id: userRecord.id, email });
        const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "";
        if (base) {
          acceptUrl = `${base}/api/users/invite/accept?token=${encodeURIComponent(token)}`;
        }
      }
    }

    await sendWelcomeUser({ email, fullName, role, acceptUrl });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
