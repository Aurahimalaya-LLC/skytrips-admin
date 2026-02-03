import { supabaseAdmin as supabase } from "./supabaseAdmin";
import crypto from "crypto";

export type OTPType = "signup" | "reset_password";

export interface OTPConfig {
  length: number;
  expiryMinutes: number;
  maxAttempts: number;
  cooldownMinutes: number;
}

const DEFAULT_CONFIG: OTPConfig = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  cooldownMinutes: 1,
};

/**
 * Generates a random numeric OTP
 */
export function generateOTPCode(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Stores a new OTP in the database and handles rate limiting
 */
export async function createAndStoreOTP(
  email: string,
  type: OTPType,
  config: OTPConfig = DEFAULT_CONFIG
) {
  // Check for existing OTP to enforce cooldown
  const { data: existing } = await supabase
    .from("verification_otps")
    .select("last_sent_at")
    .eq("email", email)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const lastSent = new Date(existing.last_sent_at).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - lastSent) / (1000 * 60);

    if (diffMinutes < config.cooldownMinutes) {
      throw new Error(`Please wait ${Math.ceil(config.cooldownMinutes - diffMinutes)} minute(s) before requesting a new code.`);
    }
  }

  // Hourly limit check
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  const { count } = await supabase
    .from("verification_otps")
    .select("*", { count: 'exact', head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo.toISOString());

  if (count && count >= 5) {
    throw new Error("Too many verification codes requested. Please try again in an hour.");
  }

  const otpCode = generateOTPCode(config.length);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + config.expiryMinutes);

  const { error } = await supabase.from("verification_otps").insert({
    email,
    otp_code: otpCode,
    type,
    expires_at: expiresAt.toISOString(),
    attempts: 0,
    last_sent_at: new Date().toISOString(),
  });

  if (error) throw error;

  console.log(`[OTP] Created ${otpCode} for ${email} (${type})`);

  return otpCode;
}

/**
 * Verifies an OTP code
 */
export async function verifyOTPCode(
  email: string,
  code: string,
  type: OTPType,
  config: OTPConfig = DEFAULT_CONFIG
) {
  const { data: otpRecord, error } = await supabase
    .from("verification_otps")
    .select("*")
    .eq("email", email)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !otpRecord) {
    throw new Error("Invalid or expired verification code.");
  }

  // Check if expired
  if (new Date(otpRecord.expires_at) < new Date()) {
    throw new Error("Verification code has expired.");
  }

  // Check attempts
  if (otpRecord.attempts >= config.maxAttempts) {
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  // Verify code
  if (otpRecord.otp_code !== code) {
    // Increment attempts
    await supabase
      .from("verification_otps")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    console.warn(`[OTP] Failed attempt for ${email} (${type}): ${code}`);
    throw new Error("Invalid verification code.");
  }

  // If successful, delete the OTP so it can't be reused
  await supabase.from("verification_otps").delete().eq("id", otpRecord.id);

  console.log(`[OTP] Verified successfully for ${email} (${type})`);

  return true;
}
