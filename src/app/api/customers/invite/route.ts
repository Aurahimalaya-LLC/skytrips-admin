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

    const result = await sendCustomerInvite({
      email,
      firstName,
      lastName,
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
