const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSchema() {
  console.log("--- Schema Debug ---");
  
  // 1. Check if verification_otps table exists
  const { data: tables, error: tableError } = await supabase
    .from('verification_otps')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error("❌ Table 'verification_otps' error:", tableError.message);
    if (tableError.message.includes("not find")) {
      console.log("💡 TIP: You MUST run the SQL in 20260131_create_verification_otps_table.sql in your Supabase SQL Editor.");
    }
  } else {
    console.log("✅ Table 'verification_otps' is accessible.");
  }

  // 2. Check if customers table has correct columns
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('email, firstName, lastName, auth_user_id')
    .limit(1);

  if (customerError) {
    console.error("❌ Table 'customers' schema error:", customerError.message);
  } else {
    console.log("✅ Table 'customers' has required columns.");
  }

  process.exit(0);
}

debugSchema();
