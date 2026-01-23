-- Add travelDate column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS "travelDate" text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
