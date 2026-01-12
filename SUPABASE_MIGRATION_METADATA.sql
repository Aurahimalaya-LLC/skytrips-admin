-- Migration: Add alt_text and caption columns to media table

-- Add columns if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'alt_text') then
        alter table public.media add column alt_text text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'media' and column_name = 'caption') then
        alter table public.media add column caption text;
    end if;
end $$;

-- Create indexes for performance (though text fields are often better indexed with gin/gist, btree is standard for simple equality/prefix)
create index if not exists idx_media_alt_text on public.media(alt_text);
-- Caption is likely too large for btree indexing efficiently for sorting, but for full text search we might want tsvector later.
-- For now, we skip heavy indexing on caption unless full text search is explicitly requested beyond "proper indexing".

-- Audit Logs (Enhancement: Ensure audit log table exists as per initial setup, or create if missing)
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

create policy "Allow authenticated users to insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (auth.uid() = performed_by);

create policy "Allow authenticated users to view audit logs"
  on public.audit_logs for select
  to authenticated
  using (true);
