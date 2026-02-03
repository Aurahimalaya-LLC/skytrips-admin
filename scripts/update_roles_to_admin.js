require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function promoteUsersToAdmin() {
  console.log('--- Promoting Users to Admin ---');

  // 1. Get all users from user_roles
  const { data: roles, error: fetchError } = await supabase
    .from('user_roles')
    .select('*');

  if (fetchError) {
    console.error('Error fetching roles:', fetchError);
    return;
  }

  console.log(`Found ${roles.length} users in user_roles.`);

  // 2. Update each one to 'admin'
  for (const userRole of roles) {
    if (userRole.role !== 'admin') {
      console.log(`Updating user ${userRole.user_id} (current: ${userRole.role}) to 'admin'...`);
      
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', userRole.user_id);

      if (updateError) {
        console.error(`Failed to update user ${userRole.user_id}:`, updateError);
      } else {
        console.log(`Successfully updated user ${userRole.user_id} to admin.`);
      }
    } else {
      console.log(`User ${userRole.user_id} is already admin.`);
    }
  }
  
  console.log('--- Done ---');
}

promoteUsersToAdmin();
