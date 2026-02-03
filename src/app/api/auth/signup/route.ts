import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Create user using Admin API (this avoids the default confirmation email)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { firstName, lastName },
      email_confirm: false // We will confirm manually via OTP
    });

    if (error) {
      console.log(`Signup error for ${email}:`, error.message, error.status);
      // If user already exists, check if they are confirmed
      if (error.message.includes("already registered") || error.status === 422 || error.message.includes("already exists")) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (!listError && listData?.users) {
          let existingUser = null;
          for (const u of listData.users) {
            if (u.email === email) {
              existingUser = u;
              break;
            }
          }
          if (existingUser) {
            console.log(`Found existing user ${existingUser.id} for ${email}. Confirmed: ${!!existingUser.email_confirmed_at}`);
            
            if (existingUser.email_confirmed_at) {
              return NextResponse.json({ 
                success: false, 
                error: "This email is already registered and verified. Please log in.",
                isConfirmed: true
              }, { status: 400 });
            }

            // If user exists but is NOT confirmed, update their password and metadata
            // They will still need to verify via OTP to log in
            console.log(`Updating unconfirmed user ${existingUser.id} with new password and metadata. Password length: ${password.length}`);
            
            // Try updating password separately to ensure it works
            const { data: pwData, error: pwError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              password: password
            });

            if (pwError) {
              console.error(`Error updating password for user ${existingUser.id}:`, pwError.message);
              throw pwError;
            }

            // Update metadata separately
            const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              user_metadata: { firstName, lastName },
              email_confirm: false
            });

            if (metaError) {
              console.error(`Error updating metadata for user ${existingUser.id}:`, metaError.message);
              // We don't throw here as password was updated
            }

            console.log(`Successfully updated unconfirmed user ${existingUser.id}`);

            return NextResponse.json({ 
              success: true, 
              message: "User record updated. Please verify your email.",
              alreadyExists: true 
            });
          }
        }
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create account";
    console.error("Error in /api/auth/signup:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
