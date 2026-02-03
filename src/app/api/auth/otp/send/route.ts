import { NextRequest, NextResponse } from "next/server";
import { createAndStoreOTP, OTPType } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mail";
import { sendOTPSMS } from "@/lib/sms";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, type } = body as { email: string; phone?: string; type: OTPType };

    if (!email || !type) {
      return NextResponse.json(
        { error: "Email and type are required" },
        { status: 400 }
      );
    }

    // 0. For reset_password, verify user exists
    if (type === "reset_password") {
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;
      
      let user = null;
      for (const u of listData.users) {
        if (u.email === email) {
          user = u;
          break;
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email address." },
          { status: 404 }
        );
      }
    }

    // 1. Generate and store OTP
    const otp = await createAndStoreOTP(email, type);

    // 2. Send via Email
    await sendOTPEmail({ email, otp, type });

    // 3. Send via SMS if phone is provided
    if (phone) {
      try {
        await sendOTPSMS({ phone, otp, type });
      } catch (smsError) {
        console.error("Failed to send OTP via SMS:", smsError);
        // We don't fail the whole request if SMS fails but email succeeds
      }
    }

    return NextResponse.json({ success: true, message: "Verification code sent successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send verification code";
    console.error("Error in /api/auth/otp/send:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
