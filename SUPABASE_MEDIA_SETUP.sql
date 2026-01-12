-- Create a bucket for media files
-- Note: You can also do this in the Supabase Dashboard > Storage
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Create a table for media files metadata
create table if not exists public.media_files (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  file_path text not null,
  url text not null,
  type text not null,
  size bigint not null,
  tags text[] default '{}',
  category text default 'uncategorized',
  uploaded_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.media_files enable row level security;

-- Policies for media_files
create policy "Allow authenticated users to view all media"
  on public.media_files for select
  to authenticated
  using (true);

create policy "Allow authenticated users to upload media"
  on public.media_files for insert
  to authenticated
  with check (true);

create policy "Allow authenticated users to update their own media"
  on public.media_files for update
  to authenticated
  using (auth.uid() = uploaded_by);

create policy "Allow authenticated users to delete their own media"
  on public.media_files for delete
  to authenticated
  using (auth.uid() = uploaded_by);

-- Policies for Storage (media bucket)
create policy "Allow authenticated users to upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "Allow authenticated users to update files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

create policy "Allow authenticated users to delete files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

create policy "Allow public to view files"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

-- Audit Logs Table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  table_name text not null,
  record_id uuid,
  performed_by uuid references auth.users(id),
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

create policy "Allow authenticated users to view audit logs"
  on public.audit_logs for select
  to authenticated
  using (true);

create policy "Allow authenticated users to insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (auth.uid() = performed_by);
