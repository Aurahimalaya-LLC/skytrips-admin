require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  console.log('--- Checking RLS Policies ---');
  
  // Query pg_policies via RPC if possible? No, usually can't query system tables via API directly unless exposed.
  // But we can try to query a table that we know should have a policy.
  // Actually, we can't easily check policies via JS client without a custom function.
  
  // However, we can infer it.
  // I will just assume they might not have run it.
  // But wait, if I can't query system tables, I can't verify.
  
  // Let's try to query pg_policies directly.
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'bookings');
    
  if (error) {
    console.log('Cannot query pg_policies directly (expected).');
    console.log('Error:', error.message);
  } else {
    console.log('Found policies for bookings:', data.map(p => p.policyname));
  }
}

checkPolicies();
