
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAgenciesSchema() {
  console.log('Checking agencies table columns...');
  
  const { data, error } = await supabaseAdmin
    .from('agencies')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching agencies:', error);
  } else {
    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('No agencies found to check columns');
    }
  }
}

checkAgenciesSchema();
