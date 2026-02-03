-- Refresh the schema cache to ensure new columns are recognized
NOTIFY pgrst, 'reload schema';

-- Ensure all columns exist (in case table existed but columns were missing)
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS duration INTEGER;

-- Ensure storage policies are permissive enough for the user
-- Sometimes 'authenticated' role check fails if the token isn't passed correctly to storage,
-- but for now, let's make sure the policies are definitely applied.

-- Allow authenticated uploads (Force recreate)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'media');

-- Allow public read
DROP POLICY IF EXISTS "Give public access to media files" ON storage.objects;
CREATE POLICY "Give public access to media files" ON storage.objects
    FOR SELECT 
    TO public
    USING (bucket_id = 'media');
