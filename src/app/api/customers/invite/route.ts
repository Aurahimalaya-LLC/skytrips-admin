import { NextRequest, NextResponse } from "next/server";
import { sendCustomerInvite } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || "http://localhost:3000";
    const acceptUrl = `${appUrl}/portal/auth/signup?email=${encodeURIComponent(email)}`;

    const result = await sendCustomerInvite({
      email,
      firstName,
      lastName,
      acceptUrl,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
