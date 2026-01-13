const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars from .env.local manually
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

async function checkSchema() {
  console.log('Checking agencies table schema...');
  
  // Method 1: Try to select the 'number' column
  const { data, error } = await supabase
    .from('agencies')
    .select('number')
    .limit(1);

  if (error) {
    console.error('Error selecting number column:', error);
    if (error.code === 'PGRST200') {
        console.log("Confirmed: Schema cache issue or missing column.");
    }
  } else {
    console.log('Successfully selected number column. Data:', data);
  }
}

checkSchema();
