import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { User } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, otpVerified } = body;

    if (!email || !password || !otpVerified) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users.find((u: { email?: string }) => u.email === email);
    if (!user) throw new Error("User not found");

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: password
    });
    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update password";
    console.error("Error in /api/auth/update-password:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
