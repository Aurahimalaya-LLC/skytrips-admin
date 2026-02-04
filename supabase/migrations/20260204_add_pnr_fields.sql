-- Add PNR related fields to flight_inquiries
ALTER TABLE flight_inquiries 
ADD COLUMN IF NOT EXISTS pnr_text TEXT,
ADD COLUMN IF NOT EXISTS pnr_parsed_data JSONB,
ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Create index for faster PNR lookups
CREATE INDEX IF NOT EXISTS idx_flight_inquiries_pnr_number 
ON flight_inquiries ((pnr_parsed_data->>'pnr_number'));

-- Create storage bucket for PNR previews if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pnr-previews', 'pnr-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to pnr-previews
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'pnr-previews');

-- Policy to allow authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pnr-previews' 
  AND auth.role() = 'authenticated'
);
