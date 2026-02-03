# Implement OTP-based Customer Verification System

This plan outlines the steps to replace the current confirmation link mechanism with a robust OTP (One-Time Password) system for both registration and password resets.

## 1. Database Schema
- **Create `verification_otps` table**:
    - `id`: UUID (Primary Key)
    - `email`: Text (Target for verification)
    - `phone`: Text (Optional, for SMS)
    - `otp_code`: Text (Hashed or plain depending on security preference)
    - `type`: Enum ('signup', 'reset_password')
    - `expires_at`: Timestamp
    - `attempts`: Integer (To track failed tries)
    - `last_sent_at`: Timestamp (For rate limiting)
    - `metadata`: JSONB (Store any extra context)

## 2. Core Logic Implementation
- **OTP Utility (`src/lib/otp.ts`)**:
    - `generateOTP(length, complexity)`: Helper to create secure codes.
    - `verifyOTP(email, code, type)`: Logic to validate code against database, checking for expiration and max attempts.
    - `canResendOTP(email, type)`: Check cooldown period to prevent abuse.
- **Notification Updates**:
    - Update `mail.ts` with new OTP email templates.
    - Enhance `sms.ts` to support OTP delivery messages.

## 3. Backend API Routes
- **`POST /api/auth/otp/send`**: 
    - Rate limits requests.
    - Generates OTP.
    - Stores in `verification_otps`.
    - Sends via Email or SMS.
- **`POST /api/auth/otp/verify`**: 
    - Validates the provided OTP.
    - If valid for signup: Marks user as verified in Supabase/database.
    - If valid for reset: Returns a temporary verification token to allow password update.

## 4. Frontend Refactoring
- **Signup Page (`signup/page.tsx`)**:
    - Update flow: Signup -> Show OTP input field -> Success.
    - Add "Resend OTP" with cooldown timer.
- **Forgot Password Page (`forgot-password/page.tsx`)**:
    - Update flow: Enter Email -> Show OTP input field -> Redirect to Update Password.
- **Update Password Page (`update-password/page.tsx`)**:
    - Ensure page only accepts updates if a valid OTP session exists.

## 5. Security & Cleanup
- **Rate Limiting**: Implement per-email and per-IP cooldowns.
- **Logging**: Detailed logs for OTP generation, delivery failures, and suspicious verification attempts.
- **Cleanup**: Remove legacy "Check your email for link" messages and Supabase Auth link-based redirect configurations if applicable.

## 6. Testing Strategy
- **Unit Tests**: OTP generation and validation logic.
- **Integration Tests**: Full flow from request to verification.
- **Edge Cases**: Expired codes, invalid attempts (brute force protection), and multiple resend requests.

Do you want me to proceed with creating the database migration first?