-- Migration to add public profile fields to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS public_profile_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS public_bio TEXT;

-- Create policy to allow public read access for specific fields when public_profile_enabled is true
-- However, since RLS is often complex for public access with joins, 
-- we will primarily rely on the API for data sanitization.
-- But for direct Supabase client usage (if any), we can add a policy:
DROP POLICY IF EXISTS "Enable public read access for public profiles" ON public.customers;
CREATE POLICY "Enable public read access for public profiles" 
ON public.customers 
FOR SELECT 
USING (public_profile_enabled = true);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
