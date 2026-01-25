-- Add paymentMethod column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS "paymentMethod" text;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
