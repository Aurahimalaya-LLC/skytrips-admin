-- Add seo_image_url to airlines table
ALTER TABLE airlines 
ADD COLUMN IF NOT EXISTS seo_image_url text;
