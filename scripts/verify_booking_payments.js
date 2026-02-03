const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
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
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('Verifying Booking Payments View...');

  try {
    const { data, error } = await supabase
      .from('view_booking_payments_details')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // undefined_table
        console.error('\n❌ View "view_booking_payments_details" does not exist.');
        console.log('\nPlease run the following SQL in your Supabase Dashboard SQL Editor:');
        const sqlPath = path.join(__dirname, '..', 'supabase/migrations/20260202_create_booking_payments_view.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('\n' + '-'.repeat(50));
        console.log(sql);
        console.log('-'.repeat(50) + '\n');
      } else {
        console.error('❌ Error querying view:', error.message);
      }
    } else {
      console.log('✅ View exists and is accessible.');
      if (data.length > 0) {
        console.log('Sample Row:', data[0]);
      } else {
        console.log('View is empty (no data returned). This is expected if Bookings/Payments are empty.');
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

verifySetup();
