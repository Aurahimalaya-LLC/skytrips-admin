const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkUsers() {
  console.log("Fetching registered users from Supabase Auth...");
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Error fetching auth users:", authError.message);
    return;
  }

  console.log(`\nFound ${users.length} users in Supabase Auth:`);
  users.forEach(user => {
    console.log(`- Email: ${user.email}, ID: ${user.id}, Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
  });

  console.log("\nFetching customers from public.customers table...");
  const { data: customers, error: dbError } = await supabase
    .from('customers')
    .select('email, firstName, lastName, isVerified');

  if (dbError) {
    console.error("Error fetching customers:", dbError.message);
    return;
  }

  console.log(`Found ${customers.length} customers in database:`);
  customers.forEach(customer => {
    console.log(`- Email: ${customer.email}, Name: ${customer.firstName} ${customer.lastName}, Verified: ${customer.isVerified}`);
  });
}

checkUsers();
