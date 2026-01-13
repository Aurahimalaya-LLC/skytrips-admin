const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCacheIntegrity() {
  console.log('Testing schema cache integrity...');
  
  // Test 1: Check if 'number' column is accessible
  console.log('Test 1: Accessing "number" column...');
  const { data, error } = await supabase
    .from('agencies')
    .select('number')
    .limit(1);

  if (error) {
    console.error('❌ Failed to access number column:', error.message);
    if (error.code === '42703') {
      console.error('   -> Root cause: Column missing in database.');
      console.error('   -> Fix: Run the SQL in scripts/fix_agencies_schema.sql in Supabase Dashboard.');
    } else if (error.code === 'PGRST200') {
      console.error('   -> Root cause: Schema cache stale.');
      console.error('   -> Fix: Run NOTIFY pgrst, "reload schema"; in Supabase SQL Editor.');
    }
    process.exit(1);
  } else {
    console.log('✅ Successfully accessed "number" column.');
  }

  console.log('\nSchema integrity verification passed.');
}

testCacheIntegrity();
