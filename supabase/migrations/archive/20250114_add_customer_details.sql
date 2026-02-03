-- Add customer_details column to bookings table to store snapshot of customer data
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS customer_details JSONB DEFAULT '{}'::jsonb;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
