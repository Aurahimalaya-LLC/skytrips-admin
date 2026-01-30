import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration missing" },
        { status: 500 }
      );
    }

    // Check user_profiles first
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({ exists: true, user: profile });
    }

    // Fallback: Check 'users' table if it exists (legacy support)
    // We suppress error here if table doesn't exist
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();
      
    if (user) {
      return NextResponse.json({ exists: true, user });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Verify user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
