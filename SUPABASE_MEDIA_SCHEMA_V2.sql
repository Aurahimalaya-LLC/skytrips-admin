-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 2. Media_Type Table (Created first as it's referenced by Media Table logic ideally, though not strictly a FK in user request, good for lookup)
create table if not exists public.media_types (
    type_id serial primary key,
    type_name varchar(50) not null unique, -- 'image', 'video', 'audio', 'document'
    extensions jsonb not null default '[]'::jsonb
);

-- Insert default types
insert into public.media_types (type_name, extensions) values
('image', '["jpg", "jpeg", "png", "gif", "webp", "svg"]'),
('video', '["mp4", "webm", "mov", "avi"]'),
('audio', '["mp3", "wav", "ogg", "m4a"]'),
('document', '["pdf", "doc", "docx", "xls", "xlsx", "txt"]')
on conflict (type_name) do nothing;

-- 1. Media Table
create table if not exists public.media (
    media_id uuid default gen_random_uuid() primary key,
    title varchar(255) not null,
    description text,
    file_path varchar(1024) not null, -- Path in Supabase Storage
    file_size bigint,
    mime_type varchar(100),
    duration integer, -- in seconds
    width integer,
    height integer,
    uploaded_by uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for searching and sorting
create index idx_media_created_at on public.media(created_at desc);
create index idx_media_title on public.media(title);
create index idx_media_mime_type on public.media(mime_type);
create index idx_media_uploaded_by on public.media(uploaded_by);

-- 3. Media_Metadata Table
create type metadata_type_enum as enum ('string', 'number', 'boolean', 'json');

create table if not exists public.media_metadata (
    metadata_id uuid default gen_random_uuid() primary key,
    media_id uuid references public.media(media_id) on delete cascade,
    key varchar(255) not null,
    value text,
    data_type metadata_type_enum default 'string',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_media_metadata_media_id on public.media_metadata(media_id);
create index idx_media_metadata_key on public.media_metadata(key);

-- 4. Media_Tags Table
create table if not exists public.media_tags (
    tag_id uuid default gen_random_uuid() primary key,
    media_id uuid references public.media(media_id) on delete cascade,
    tag_name varchar(100) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_media_tags_media_id on public.media_tags(media_id);
create index idx_media_tags_tag_name on public.media_tags(tag_name);
-- Unique constraint to prevent duplicate tags on same media
create unique index idx_media_tags_unique on public.media_tags(media_id, tag_name);

-- 5. Media_Categories Table
-- Note: User asked for category_id, media_id, category_name. 
-- This implies a many-to-many relationship where categories might be duplicated text or a separate table.
-- Given the requirement "category_id (Primary Key), media_id (FK), category_name", it looks like a mapping table 
-- where the category name is stored directly, similar to tags but conceptually different.
create table if not exists public.media_categories (
    category_id uuid default gen_random_uuid() primary key,
    media_id uuid references public.media(media_id) on delete cascade,
    category_name varchar(100) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_media_categories_media_id on public.media_categories(media_id);
create index idx_media_categories_category_name on public.media_categories(category_name);


-- RLS Policies

-- Enable RLS
alter table public.media enable row level security;
alter table public.media_metadata enable row level security;
alter table public.media_tags enable row level security;
alter table public.media_categories enable row level security;
alter table public.media_types enable row level security;

-- Media Policies
create policy "Allow authenticated users to view all media"
    on public.media for select
    to authenticated
    using (true);

create policy "Allow authenticated users to upload media"
    on public.media for insert
    to authenticated
    with check (true);

create policy "Allow users to update their own media"
    on public.media for update
    to authenticated
    using (auth.uid() = uploaded_by);

create policy "Allow users to delete their own media"
    on public.media for delete
    to authenticated
    using (auth.uid() = uploaded_by);

-- Metadata Policies
create policy "Allow authenticated users to view metadata"
    on public.media_metadata for select to authenticated using (true);
create policy "Allow users to insert metadata for their media"
    on public.media_metadata for insert to authenticated with check (
        exists (select 1 from public.media where media_id = media_metadata.media_id and uploaded_by = auth.uid())
    );
create policy "Allow users to delete metadata for their media"
    on public.media_metadata for delete to authenticated using (
        exists (select 1 from public.media where media_id = media_metadata.media_id and uploaded_by = auth.uid())
    );

-- Tags Policies
create policy "Allow authenticated users to view tags"
    on public.media_tags for select to authenticated using (true);
create policy "Allow users to manage tags for their media"
    on public.media_tags for all to authenticated using (
        exists (select 1 from public.media where media_id = media_tags.media_id and uploaded_by = auth.uid())
    );

-- Categories Policies
create policy "Allow authenticated users to view categories"
    on public.media_categories for select to authenticated using (true);
create policy "Allow users to manage categories for their media"
    on public.media_categories for all to authenticated using (
        exists (select 1 from public.media where media_id = media_categories.media_id and uploaded_by = auth.uid())
    );

-- Media Types Policies (Read Only)
create policy "Allow authenticated users to view media types"
    on public.media_types for select to authenticated using (true);

-- Trigger for updated_at
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_media_modtime
    before update on public.media
    for each row
    execute procedure update_modified_column();

-- Function to get media with details (Optional helper)
create or replace view view_media_details as
select 
    m.*,
    coalesce((select json_agg(tag_name) from public.media_tags t where t.media_id = m.media_id), '[]'::json) as tags,
    coalesce((select json_agg(category_name) from public.media_categories c where c.media_id = m.media_id), '[]'::json) as categories
from public.media m;
