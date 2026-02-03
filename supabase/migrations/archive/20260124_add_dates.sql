-- Add departureDate and returnDate columns to bookings table

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS "departureDate" text,
ADD COLUMN IF NOT EXISTS "returnDate" text;

-- Optional: Migrate existing travelDate data to departureDate if needed
-- UPDATE public.bookings SET "departureDate" = "travelDate" WHERE "departureDate" IS NULL;
