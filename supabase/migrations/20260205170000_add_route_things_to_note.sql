-- Add "Things to Note" columns to routes table
ALTER TABLE routes
ADD COLUMN IF NOT EXISTS things_to_note_origin_airport TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_time_diff TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_currency TEXT,
ADD COLUMN IF NOT EXISTS things_to_note_power_plugs TEXT;
