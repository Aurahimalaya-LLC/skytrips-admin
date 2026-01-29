import { NextResponse } from "next/server";
import { sendWelcomeUser } from "@/lib/mail";
import { EmailEventType } from "@/types/email-event";
import { getAdminClient } from "@/lib/supabase-server";
import { signSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.log("Received POST request to /api/events");
  const body = await req.json().catch(() => null);
  const type = body?.type || "";
  console.log("Event Type:", type);

  const data = body?.data || {};
  if (!type) {
    console.error("Missing event type");
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }
  if (type === EmailEventType.UserCreated) {
    const email = String(data?.email || "");
    console.log("Processing UserCreated event for:", email);

    const fullName = String(data?.fullName || "");
    const role = String(data?.role || "");
    const readablePassword = String(data?.readable_password || "");
    if (!email) {
      console.warn("No email provided in event data");
      return NextResponse.json({ ok: true, warning: "no_email" });
    }
    const hasMailgun = !!(process.env.MAILGUN_API_KEY || process.env.NEXT_PUBLIC_MAILGUN_API_KEY) && !!(process.env.MAILGUN_DOMAIN || process.env.NEXT_PUBLIC_MAILGUN_DOMAIN);
    
    console.log("API Route Mailgun Check:", { hasMailgun });

    if (!hasMailgun) {
      console.warn("Mailgun not configured in API route check");
      return NextResponse.json({ ok: true, warning: "mail_not_configured" });
    }
    try {
      const supabase = getAdminClient();
      let acceptUrl = "";
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
      console.log("Calling sendWelcomeUser...");
      const mailRes = await sendWelcomeUser({ email, fullName, role, readablePassword, acceptUrl });
      console.log("sendWelcomeUser result:", mailRes);
      return NextResponse.json({ ok: true, mailgun: mailRes });
    } catch(e) {
      console.error("Error in sendWelcomeUser:", e);
      return NextResponse.json({ ok: true, warning: "mail_failed", error: e instanceof Error ? e.message : String(e) });
    }
  }
  console.warn("Unhandled event type:", type);
  return NextResponse.json({ ok: true, warning: "unhandled_event" });
}
