import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, message, html, attachment, attachments } = body;

    if (!to || !subject || (!message && !html)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hasAuth =
      !!(process.env.SMTP_USER || process.env.SUPABASE_SMTP_USER) &&
      !!(process.env.SMTP_PASS || process.env.SUPABASE_SMTP_PASS || process.env.MAILGUN_API_KEY);
    if (!hasAuth) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const mailAttachments = [];

    // Process single attachment (legacy support)
    if (attachment && attachment.content && attachment.filename) {
      let base64Data = attachment.content;
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }
      const buffer = Buffer.from(base64Data, "base64");
      mailAttachments.push({
        filename: attachment.filename,
        content: buffer,
        contentType: attachment.contentType || "application/pdf",
      });
    }

    // Process multiple attachments
    if (Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.content && att.filename) {
          let base64Data = att.content;
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }
          const buffer = Buffer.from(base64Data, "base64");
          mailAttachments.push({
            filename: att.filename,
            content: buffer,
            contentType: att.contentType || "application/octet-stream",
          });
        }
      }
    }

    await sendEmail({
      to,
      subject,
      html: html || message.replace(/\n/g, "<br>"),
      attachment: mailAttachments.length > 0 ? mailAttachments : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
