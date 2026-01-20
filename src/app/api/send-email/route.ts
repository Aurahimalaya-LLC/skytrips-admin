import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, message, html, attachment } = body;

    if (!to || !subject || (!message && !html)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let mailAttachment = undefined;
    if (attachment && attachment.content && attachment.filename) {
      // content is expected to be a base64 string
      // Check if it has data URI prefix and strip it, otherwise use as is
      let base64Data = attachment.content;
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      const buffer = Buffer.from(base64Data, "base64");

      mailAttachment = {
        filename: attachment.filename,
        data: buffer,
        contentType: "application/pdf",
      };
    }

    await sendEmail({
      to,
      subject,
      html: html || message.replace(/\n/g, "<br>"),
      attachment: mailAttachment,
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
