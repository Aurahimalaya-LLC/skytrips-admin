
-- 1. Create a Type for the "Things to Note" structure
-- This allows us to use an array of this composite type in the table.
CREATE TYPE things_to_note_item AS (
    origin_airport TEXT,
    time_difference TEXT,
    currency TEXT,
    power_plugs TEXT
);

-- 2. Add the column to the routes table as an ARRAY of this type
-- We use 'ALTER TABLE' assuming the table already exists.
-- If creating fresh, include this line in the CREATE TABLE statement.
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS things_to_note things_to_note_item[];

-- COMMENT: This column replaces the individual 'things_to_note_*' columns
-- if the goal is to store multiple notes or a structured list.
-- If the goal is just to group the existing single-value columns into a JSONB array for flexibility:

-- ALTERNATIVE: JSONB Approach (Recommended for flexibility)
-- This is often preferred over Postgres Arrays of Composite Types for frontend compatibility.
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS things_to_note_list JSONB DEFAULT '[]'::jsonb;

-- Example Data Format for JSONB column:
-- [
--   {
--     "origin_airport": "Arrive 3 hours early...",
--     "time_difference": "5 hours behind...",
--     "currency": "NPR...",
--     "power_plugs": "Type C..."
--   }
-- ]
