-- Migration to add Route Info columns to routes table
-- This fixes the error: Could not find the 'average_flight_time' column

ALTER TABLE routes
ADD COLUMN IF NOT EXISTS average_flight_time TEXT,
ADD COLUMN IF NOT EXISTS distance TEXT,
ADD COLUMN IF NOT EXISTS cheapest_month TEXT,
ADD COLUMN IF NOT EXISTS daily_flights INTEGER;

-- Notify pgrst to reload schema
NOTIFY pgrst, 'reload schema';
