-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist to ensure clean state
drop table if exists public.media_metadata cascade;
drop table if exists public.media_tags cascade;
drop table if exists public.media_categories cascade;
drop table if exists public.media cascade;
drop table if exists public.media_types cascade;

-- 1. Media Table
create table public.media (
    media_id uuid default gen_random_uuid() primary key,
    title varchar(255) not null,
    description text,
    file_path varchar(1024) not null,
    file_size bigint,
    mime_type varchar(100),
    duration integer,
    width integer,
    height integer,
    uploaded_by uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Media_Tags Table
create table public.media_tags (
    tag_id uuid default gen_random_uuid() primary key,
    media_id uuid not null, -- Removed foreign key constraint for now to avoid PGRST200 if relationships aren't detected immediately, or ensure we add it correctly
    tag_name varchar(100) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint fk_media foreign key (media_id) references public.media(media_id) on delete cascade
);

-- 3. Media_Categories Table
create table public.media_categories (
    category_id uuid default gen_random_uuid() primary key,
    media_id uuid not null,
    category_name varchar(100) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint fk_media foreign key (media_id) references public.media(media_id) on delete cascade
);

-- Indexes
create index idx_media_tags_media_id on public.media_tags(media_id);
create index idx_media_categories_media_id on public.media_categories(media_id);

-- Enable RLS
alter table public.media enable row level security;
alter table public.media_tags enable row level security;
alter table public.media_categories enable row level security;

-- Policies
create policy "Public view media" on public.media for select using (true);
create policy "Authenticated insert media" on public.media for insert with check (auth.role() = 'authenticated');
create policy "Authenticated delete media" on public.media for delete using (auth.role() = 'authenticated');

create policy "Public view tags" on public.media_tags for select using (true);
create policy "Authenticated insert tags" on public.media_tags for insert with check (auth.role() = 'authenticated');

create policy "Public view categories" on public.media_categories for select using (true);
create policy "Authenticated insert categories" on public.media_categories for insert with check (auth.role() = 'authenticated');
