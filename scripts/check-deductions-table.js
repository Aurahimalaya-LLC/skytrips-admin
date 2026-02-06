
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  console.log('Checking agency_deductions table...');
  
  // Try to select from the table
  const { data, error } = await supabaseAdmin
    .from('agency_deductions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching table:', error);
    
    // If table doesn't exist, we might need to run the SQL manually or check if migration applied
    if (error.code === '42P01') { // undefined_table
        console.log('Table does not exist. Please apply the migration manually or via dashboard.');
    }
  } else {
    console.log('Table exists and is accessible.');
  }
}

checkTable();
