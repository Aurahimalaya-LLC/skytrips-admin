-- Add selected_travellers column to manage_booking table
ALTER TABLE manage_booking 
ADD COLUMN IF NOT EXISTS selected_travellers TEXT[];
