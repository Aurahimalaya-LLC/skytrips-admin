-- Comprehensive Schema Update for Media Metadata

-- 1. Ensure columns exist with correct types
-- We use TEXT for broad compatibility, but add a CHECK constraint for title length if strictly required by business logic.
-- However, user asked for VARCHAR(255) specifically.

do $$
begin
    -- 1a. Update 'title' to be VARCHAR(255) if it exists, or add it
    if exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'title') then
        alter table public.media alter column title type varchar(255);
    else
        alter table public.media add column title varchar(255);
    end if;

    -- 1b. Ensure alt_text exists (TEXT)
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'alt_text') then
        alter table public.media add column alt_text text;
    end if;

    -- 1c. Ensure caption exists (TEXT)
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'caption') then
        alter table public.media add column caption text;
    end if;
end $$;

-- 2. Add Comments for Documentation (also helps PostgREST schema cache)
comment on column public.media.title is 'Descriptive title of the media file (max 255 chars)';
comment on column public.media.alt_text is 'Accessibility text description for screen readers';
comment on column public.media.caption is 'Extended description or credits for the media';

-- 3. Indexes for Performance
-- Title index for sorting and exact matches
create index if not exists idx_media_title on public.media(title);
-- Alt text index (optional, but good if searching by content)
create index if not exists idx_media_alt_text on public.media(alt_text);

-- 4. Verify Permissions
grant select, insert, update, delete on public.media to authenticated;
grant select on public.media to anon;
