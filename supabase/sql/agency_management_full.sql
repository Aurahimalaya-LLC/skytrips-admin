-- Comprehensive Agency Management Schema

-- 1. Agencies Table (Enhanced)
-- Extends the existing agencies table structure with additional fields for full profile management
-- Fields: Basic info, logo, contact, address, status, timestamps
create table if not exists public.agencies (
  uid uuid primary key default gen_random_uuid(),
  agency_name text not null check (char_length(agency_name) <= 100),
  description text,
  logo_url text,
  contact_person text not null check (char_length(contact_person) <= 50),
  contact_email text check (contact_email ~* '^.+@.+\..+$'),
  contact_phone text, -- mapped from number in previous schema, normalized
  website_url text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  iata_code text check (char_length(iata_code) <= 8),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended', 'pending')),
  draft boolean default false,
  deleted_at timestamptz, -- Soft delete support
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Index for frequent searches
create index if not exists idx_agencies_name on public.agencies(agency_name);
create index if not exists idx_agencies_status on public.agencies(status);
create index if not exists idx_agencies_country on public.agencies(country);

-- 2. Agency Users / Permissions
-- Links agencies to auth.users for role-based access within an agency
create table if not exists public.agency_users (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  user_uid uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agent' check (role in ('owner', 'admin', 'agent', 'viewer')),
  created_at timestamptz not null default now(),
  unique(agency_uid, user_uid)
);

-- 3. Agency Services / Offerings
-- Defines specific services provided by an agency (e.g., flight booking, tour packages)
create table if not exists public.agency_services (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  service_name text not null,
  description text,
  service_type text not null check (service_type in ('flight', 'hotel', 'tour', 'transfer', 'insurance', 'other')),
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 4. Agency Clients / Relationships
-- Manages client relationships specific to an agency
create table if not exists public.agency_clients (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  client_name text not null,
  client_email text,
  client_phone text,
  notes text,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 5. Agency Billing / Payment Info
-- Stores billing profiles and payment configuration
create table if not exists public.agency_billing (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  billing_email text,
  tax_id text,
  currency text default 'USD',
  payment_terms text, -- e.g., 'net30', 'prepaid'
  balance decimal(12, 2) default 0.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  unique(agency_uid)
);

-- Versioning / Audit Log (Existing structure preserved/extended)
create table if not exists public.agencies_versions (
  id bigserial primary key,
  agency_uid uuid not null references public.agencies(uid) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Triggers for updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'agencies_updated_at') then
    create trigger agencies_updated_at before update on public.agencies
    for each row execute function public.set_updated_at();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'agency_services_updated_at') then
    create trigger agency_services_updated_at before update on public.agency_services
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'agency_clients_updated_at') then
    create trigger agency_clients_updated_at before update on public.agency_clients
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'agency_billing_updated_at') then
    create trigger agency_billing_updated_at before update on public.agency_billing
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- Trigger for Versioning
create or replace function public.agencies_version_snapshot() returns trigger as $$
begin
  insert into public.agencies_versions(agency_uid, snapshot, changed_by)
  values (old.uid, to_jsonb(old), auth.uid());
  return new;
end;$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'agencies_version_on_update') then
    create trigger agencies_version_on_update after update on public.agencies
    for each row execute function public.agencies_version_snapshot();
  end if;
end $$;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table public.agencies enable row level security;
alter table public.agency_users enable row level security;
alter table public.agency_services enable row level security;
alter table public.agency_clients enable row level security;
alter table public.agency_billing enable row level security;

-- Policies for Agencies
-- 1. Read: Public/Authenticated users can read active agencies (adjust based on strictness)
create policy "Agencies are viewable by authenticated users" 
  on public.agencies for select 
  using (auth.role() = 'authenticated');

-- 2. Create/Update: Only admins or agency owners (logic simplified here, typically relies on a role check or agency_users)
-- For now, allowing authenticated users to create (e.g. registration flow)
create policy "Authenticated users can create agencies" 
  on public.agencies for insert 
  with check (auth.role() = 'authenticated');

create policy "Agency owners/admins can update their agency" 
  on public.agencies for update 
  using (
    exists (
      select 1 from public.agency_users au 
      where au.agency_uid = uid 
      and au.user_uid = auth.uid() 
      and au.role in ('owner', 'admin')
    )
    or
    -- Allow global admins (if you have a global admin flag in auth.users or metadata)
    (select (auth.jwt() ->> 'is_admin')::boolean) is true
  );

-- Policies for Related Tables (Users, Services, Clients, Billing)
-- Access generally restricted to users belonging to the agency

-- Agency Users
create policy "Agency users viewable by members" 
  on public.agency_users for select 
  using (
    agency_uid in (
      select agency_uid from public.agency_users where user_uid = auth.uid()
    )
  );

-- Agency Services
create policy "Services viewable by authenticated users" 
  on public.agency_services for select 
  using (auth.role() = 'authenticated');

create policy "Services manageable by agency admins" 
  on public.agency_services for all 
  using (
    exists (
      select 1 from public.agency_users au 
      where au.agency_uid = agency_uid 
      and au.user_uid = auth.uid() 
      and au.role in ('owner', 'admin')
    )
  );

-- Agency Clients
create policy "Clients viewable by agency members" 
  on public.agency_clients for select 
  using (
    exists (
      select 1 from public.agency_users au 
      where au.agency_uid = agency_uid 
      and au.user_uid = auth.uid()
    )
  );

create policy "Clients manageable by agency agents" 
  on public.agency_clients for all 
  using (
    exists (
      select 1 from public.agency_users au 
      where au.agency_uid = agency_uid 
      and au.user_uid = auth.uid() 
      and au.role in ('owner', 'admin', 'agent')
    )
  );

-- Agency Billing
create policy "Billing viewable only by owners/admins" 
  on public.agency_billing for select 
  using (
    exists (
      select 1 from public.agency_users au 
      where au.agency_uid = agency_uid 
      and au.user_uid = auth.uid() 
      and au.role in ('owner', 'admin')
    )
  );
