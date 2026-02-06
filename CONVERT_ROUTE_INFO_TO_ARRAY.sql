
-- 1. Create a Type for the "Route Information" structure
-- This allows us to use an array of this composite type in the table.
CREATE TYPE route_info_item AS (
    average_flight_time TEXT,
    distance TEXT,
    cheapest_months TEXT, -- Comma-separated or serialized array
    daily_flights INTEGER
);

-- 2. Add the column to the routes table as an ARRAY of this type
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS route_info_list route_info_item[];

-- ALTERNATIVE: JSONB Approach (Recommended for flexibility)
-- This is often preferred over Postgres Arrays of Composite Types for frontend compatibility.
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS route_info JSONB DEFAULT '[]'::jsonb;

-- Example Data Format for JSONB column:
-- [
--   {
--     "average_flight_time": "2h 30m",
--     "distance": "1,200 km",
--     "cheapest_months": "January, March",
--     "daily_flights": 5
--   }
-- ]
