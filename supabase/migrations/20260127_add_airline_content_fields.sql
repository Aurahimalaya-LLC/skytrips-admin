-- Add content fields to airlines table
ALTER TABLE airlines 
ADD COLUMN IF NOT EXISTS about_fleet text,
ADD COLUMN IF NOT EXISTS in_flight_experience text;
