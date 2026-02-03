-- Add SEO and robots meta fields to airports
ALTER TABLE public.airports
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS seo_image_url text,
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS canonical_url text,
ADD COLUMN IF NOT EXISTS schema_markup text,
ADD COLUMN IF NOT EXISTS no_index boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_follow boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_archive boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_image_index boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS no_snippet boolean DEFAULT false;

COMMENT ON COLUMN public.airports.seo_title IS 'SEO page title for airport detail';
COMMENT ON COLUMN public.airports.meta_description IS 'SEO meta description for airport detail';
COMMENT ON COLUMN public.airports.seo_image_url IS 'OpenGraph/Twitter image URL';
COMMENT ON COLUMN public.airports.slug IS 'URL slug for airport page';
COMMENT ON COLUMN public.airports.canonical_url IS 'Canonical URL to avoid duplicate content';
COMMENT ON COLUMN public.airports.schema_markup IS 'JSON-LD schema markup';
COMMENT ON COLUMN public.airports.no_index IS 'Robots directive: noindex';
COMMENT ON COLUMN public.airports.no_follow IS 'Robots directive: nofollow';
COMMENT ON COLUMN public.airports.no_archive IS 'Robots directive: noarchive';
COMMENT ON COLUMN public.airports.no_image_index IS 'Robots directive: noimageindex';
COMMENT ON COLUMN public.airports.no_snippet IS 'Robots directive: nosnippet';

NOTIFY pgrst, 'reload schema';
