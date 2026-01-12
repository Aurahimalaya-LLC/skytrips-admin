-- Fix: Ensure alt_text and caption columns exist in media table

-- 1. Reload the schema cache (in Supabase this is often done by just altering something, 
-- but explicit column addition with IF NOT EXISTS is the safest way to "remind" it).

do $$
begin
    -- Check and add alt_text if missing
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'alt_text') then
        alter table public.media add column alt_text text;
    end if;

    -- Check and add caption if missing
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'caption') then
        alter table public.media add column caption text;
    end if;
end $$;

-- 2. Force a schema cache reload by notifying pgrst (PostgREST)
-- This is a Supabase/PostgREST specific trick. NOTIFY pgrst, 'reload schema' works if you have superuser,
-- otherwise, just running a DDL statement usually triggers it.
-- The comments above are just context. The actual "fix" is often just running the DDL again.

comment on column public.media.alt_text is 'Alternative text for accessibility';
comment on column public.media.caption is 'Caption for the media file';

-- 3. Verify permissions again just in case
grant select, insert, update, delete on public.media to authenticated;
grant select on public.media to anon;
