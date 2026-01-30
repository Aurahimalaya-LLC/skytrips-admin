import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message, from } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to and message are required" },
        { status: 400 }
      );
    }

    const tokenID = process.env.TOUCHSMS_TOKEN_ID;
    const accessToken = process.env.TOUCHSMS_ACCESS_TOKEN;

    if (!tokenID || !accessToken) {
      return NextResponse.json(
        { error: "SMS service not configured on server. Please add TOUCHSMS_TOKEN_ID and TOUCHSMS_ACCESS_TOKEN to environment variables." },
        { status: 500 }
      );
    }

    const result = await sendSMS({
      to,
      message,
      from,
    });

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("Error in send-sms API route:", error);
    return NextResponse.json(
      {
        error: "Failed to send SMS",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
