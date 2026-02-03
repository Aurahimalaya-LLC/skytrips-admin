-- Create verification_otps table for OTP-based verification flow
CREATE TABLE IF NOT EXISTS verification_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    phone TEXT,
    otp_code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('signup', 'reset_password')),
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_otps_email_type ON verification_otps(email, type);

-- Add RLS policies (only accessible by service role by default)
ALTER TABLE verification_otps ENABLE ROW LEVEL SECURITY;

-- Only service role should manage this table generally
-- But we can add a policy if needed for specific use cases
