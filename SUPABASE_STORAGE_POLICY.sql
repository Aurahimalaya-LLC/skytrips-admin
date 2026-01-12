-- Enable the storage extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage";

-- Create the 'media' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = true; -- Ensure it is set to public

-- Policy to allow public access to view files in the 'media' bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'media' );

-- Policy to allow authenticated users to upload files to 'media' bucket
create policy "Authenticated Upload"
on storage.objects for insert
with check ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- Policy to allow authenticated users to update their own files
create policy "Authenticated Update"
on storage.objects for update
using ( bucket_id = 'media' and auth.uid() = owner );

-- Policy to allow authenticated users to delete their own files
create policy "Authenticated Delete"
on storage.objects for delete
using ( bucket_id = 'media' and auth.uid() = owner );
