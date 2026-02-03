require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyData() {
  console.log('--- Verifying Data ---');

  // 1. Check Bookings
  const { count: bookingsCount, error: bookingsError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });
  
  if (bookingsError) console.error('Error checking bookings:', bookingsError);
  else console.log(`Total Bookings: ${bookingsCount}`);

  // 2. Check Payments
  const { count: paymentsCount, error: paymentsError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true });

  if (paymentsError) console.error('Error checking payments:', paymentsError);
  else console.log(`Total Payments: ${paymentsCount}`);

  // 3. Check View
  const { data: viewData, error: viewError } = await supabase
    .from('view_unified_payments')
    .select('*')
    .limit(5);

  if (viewError) {
    console.error('Error querying view_unified_payments:', viewError);
  } else {
    console.log(`View returned ${viewData.length} rows.`);
    if (viewData.length > 0) {
      console.log('Sample row:', JSON.stringify(viewData[0], null, 2));
    }
  }

  // 4. Check Users and Roles
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) console.error('Error listing users:', usersError);
  else {
    console.log(`Total Auth Users: ${users.length}`);
    users.forEach(u => console.log(` - User: ${u.email} (${u.id})`));
  }

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');

  if (rolesError) console.error('Error listing user_roles:', rolesError);
  else {
    console.log(`Total User Roles: ${roles.length}`);
    roles.forEach(r => console.log(` - Role: ${r.role} for User ${r.user_id}`));
  }
}

verifyData();
