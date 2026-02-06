
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Manually applying agency_deductions migration...');
  
  // Define SQL directly since we can't easily read file in some environments (but we can here)
  // Using direct string for simplicity and reliability
  const sql = `
    -- Create agency_deductions table for tracking SQuAD and other process deductions
    create table if not exists agency_deductions (
      id uuid default gen_random_uuid() primary key,
      agency_uid uuid references agencies(uid) on delete cascade not null,
      amount numeric not null check (amount >= 0), -- Stored as positive value representing the deduction
      currency text default 'AUD',
      category text default 'SQ', -- 'SQ', 'SQuAD', 'Admin', etc.
      description text,
      created_at timestamptz default now(),
      created_by uuid references auth.users(id)
    );

    -- Enable RLS
    alter table agency_deductions enable row level security;

    -- Policies
    drop policy if exists "Enable read access for all users" on agency_deductions;
    create policy "Enable read access for all users" on agency_deductions for select using (true);

    drop policy if exists "Enable insert for authenticated users" on agency_deductions;
    create policy "Enable insert for authenticated users" on agency_deductions for insert with check (auth.role() = 'authenticated');

    drop policy if exists "Enable update for authenticated users" on agency_deductions;
    create policy "Enable update for authenticated users" on agency_deductions for update using (auth.role() = 'authenticated');

    drop policy if exists "Enable delete for authenticated users" on agency_deductions;
    create policy "Enable delete for authenticated users" on agency_deductions for delete using (auth.role() = 'authenticated');

    -- Refresh schema cache
    NOTIFY pgrst, 'reload schema';
  `;

  // Execute via RPC if available, or fallback to direct query if using a direct PG client.
  // The Supabase JS client doesn't support raw SQL execution directly unless a specific RPC function is set up.
  // HOWEVER, we previously saw 'npx supabase db push' failed, implying local docker issues.
  // If we are connecting to a remote Supabase instance (which the env vars suggest: tjrmemmsieltajotxddk.supabase.co),
  // then we CANNOT run raw SQL via JS client unless we use the Postgres connection string.
  
  // Let's try to use the REST API to check if we can just "create" via rpc or if we have to assume the user must run it.
  // Wait, if the environment is local (env suggests remote URL), we should be able to use the Dashboard SQL editor.
  
  // BUT, since I am an agent, I should try to solve it. 
  // If I cannot run SQL, I will inform the user.
  // Let's check if there is an `exec_sql` or similar RPC function commonly used in these setups.
  
  // Strategy: Try to find an existing RPC function that executes SQL, or fallback to instructing the user.
  // Searching for existing RPC functions...
  
  console.log('Cannot execute raw SQL via supabase-js client directly without an RPC function.');
  console.log('Please run the following SQL in your Supabase Dashboard SQL Editor:');
  console.log(sql);
}

applyMigration();
