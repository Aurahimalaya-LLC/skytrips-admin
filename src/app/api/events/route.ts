import { NextResponse } from "next/server";
import { sendWelcomeUser } from "@/lib/mail";
import { EmailEventType } from "@/types/email-event";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type = body?.type || "";
  const data = body?.data || {};
  if (!type) {
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }
  if (type === EmailEventType.UserCreated) {
    const email = String(data?.email || "");
    const fullName = String(data?.fullName || "");
    const role = String(data?.role || "");
    if (!email) {
      return NextResponse.json({ ok: true, warning: "no_email" });
    }
    const hasMailgun = !!process.env.NEXT_PUBLIC_MAILGUN_API_KEY && !!process.env.NEXT_PUBLIC_MAILGUN_DOMAIN;
    if (!hasMailgun) {
      return NextResponse.json({ ok: true, warning: "mail_not_configured" });
    }
    try {
      const mailRes = await sendWelcomeUser({ email, fullName, role });
      return NextResponse.json({ ok: true, mailgun: mailRes });
    } catch(e) {
      return NextResponse.json({ ok: true, warning: "mail_failed", error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok: true, warning: "unhandled_event" });
}
