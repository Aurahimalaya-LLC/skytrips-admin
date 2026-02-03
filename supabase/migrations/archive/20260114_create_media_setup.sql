-- Create Media Table if not exists
CREATE TABLE IF NOT EXISTS public.media (
    media_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    alt_text TEXT,
    caption TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Create Policies for Media Table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.media;
CREATE POLICY "Enable read access for all users" ON public.media
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.media;
CREATE POLICY "Enable insert for authenticated users" ON public.media
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for owners" ON public.media;
CREATE POLICY "Enable update for owners" ON public.media
    FOR UPDATE USING (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Enable delete for owners" ON public.media;
CREATE POLICY "Enable delete for owners" ON public.media
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Note: Supabase storage policies are on storage.objects
DROP POLICY IF EXISTS "Give public access to media files" ON storage.objects;
CREATE POLICY "Give public access to media files" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'media' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Allow owners to update/delete" ON storage.objects;
CREATE POLICY "Allow owners to update/delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'media' 
        AND auth.uid() = owner
    );
