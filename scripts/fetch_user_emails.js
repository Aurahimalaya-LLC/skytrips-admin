const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
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
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchUserEmails() {
  console.log('Connecting to Supabase...');
  console.log(`Target Table: users`);

  try {
    // Query: Select email from users, filter not null, sort by email asc
    const { data, error, count } = await supabase
      .from('users')
      .select('email, created_at', { count: 'exact' })
      .neq('email', null)
      .neq('email', '')
      .order('email', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No users found with valid emails.');
      return;
    }

    console.log(`Successfully retrieved ${data.length} email addresses.`);
    console.log('--- Email List (Sorted Alphabetically) ---');
    
    const emails = data.map(user => user.email);
    console.log(emails.join('\n'));

    // Optional: Save to file for verification
    const outputPath = path.join(__dirname, 'user_emails.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nResults saved to ${outputPath}`);

  } catch (err) {
    console.error('Database Connection/Query Error:', err.message || err);
    if (err.code) {
        console.error('Error Code:', err.code);
    }
  }
}

fetchUserEmails();
