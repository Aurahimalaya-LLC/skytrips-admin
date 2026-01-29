-- Add fleet_size and year_established columns to airlines table

ALTER TABLE airlines ADD COLUMN IF NOT EXISTS fleet_size INTEGER;
ALTER TABLE airlines ADD COLUMN IF NOT EXISTS year_established INTEGER;

-- Comment on columns
COMMENT ON COLUMN airlines.fleet_size IS 'Total number of aircraft in the fleet';
COMMENT ON COLUMN airlines.year_established IS 'Year the airline was established';
