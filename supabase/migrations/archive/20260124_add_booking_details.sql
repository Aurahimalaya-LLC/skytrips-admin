-- Add missing columns to bookings table to match the View Booking page requirements

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS "passportIssueDate" text,
ADD COLUMN IF NOT EXISTS "placeOfIssue" text,
ADD COLUMN IF NOT EXISTS "arrivalDate" text,
ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS "prices" jsonb DEFAULT '{}'::jsonb;

-- Ensure issuedthroughagency exists (it might be lowercase based on code usage)
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS "issuedthroughagency" text;
