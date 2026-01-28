
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  console.log('Fetching one row to check columns...');
  const { data, error } = await supabase
    .from("manage_booking")
    .select("*")
    .limit(1);

  if (error) {
    console.error('Fetch one row failed:', error);
  } else {
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
      console.log('No data found in table');
    }
  }
}

testQueries();
