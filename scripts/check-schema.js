
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking "customers" table...');
  
  // Try to insert a dummy record to see if table exists (will fail but give error)
  // Or better, try to select 1 record
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from customers:', error);
  } else {
    console.log('Success! Found customers table.');
    if (data.length > 0) {
      console.log('Sample record keys:', Object.keys(data[0]));
      console.log('Sample ID:', data[0].id, 'Type:', typeof data[0].id);
    } else {
      console.log('Table is empty.');
    }
  }

  console.log('\nChecking "bookings" table...');
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(1);
    
  if (bookingsError) {
    console.error('Error selecting from bookings:', bookingsError);
  } else {
    console.log('Success! Found bookings table.');
  }

  console.log('\nChecking RLS policies for "customers"...');
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies_for_table', { table_name: 'customers' }); // This RPC might not exist

  // Fallback: try raw query if RPC fails (but client doesn't support raw query directly usually)
  // Actually, we can query pg_policies if we have permissions? Usually not via PostgREST.
  // But we have service role key, maybe we can use it?
  // Supabase client doesn't support raw SQL unless via RPC.
  
  // Let's try to infer from behavior.
  // Try to select with anon key (simulating unauthenticated)
  const anonSupabase = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: anonData, error: anonError } = await anonSupabase
    .from('customers')
    .select('*')
    .limit(1);
    
  if (anonError) {
    console.log('Anon Access Error:', anonError.message);
  } else {
    console.log('Anon Access Data Length:', anonData.length);
  }
}

checkSchema();
