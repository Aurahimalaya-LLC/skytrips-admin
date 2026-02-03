const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found');
  process.exit(1);
}

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

async function fetchRegisteredEmails() {
  console.log('Connecting to Supabase...');
  // Using 'customers' table as it contains the majority of registered users (400+)
  // compared to 'users' table which only has 6.
  const targetTable = 'customers';
  console.log(`Target Table: ${targetTable}`);

  try {
    // Query: Select email and created_at from customers
    // Conditions: email is not null and not empty
    // Sort: alphabetical by email
    const { data, error } = await supabase
      .from(targetTable)
      .select('email, created_at')
      .neq('email', null)
      .neq('email', '')
      .order('email', { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No registered users found with valid emails.');
      return;
    }

    // Filter out invalid formats (basic check)
    const validEmails = data.filter(user => {
      const email = user.email.trim();
      return email.includes('@') && email.includes('.');
    });

    console.log(`Successfully retrieved ${validEmails.length} valid email addresses.`);
    console.log('--- Email List (First 20 Sorted Alphabetically) ---');
    
    const emailList = validEmails.map(user => user.email);
    console.log(emailList.slice(0, 20).join('\n'));
    if (emailList.length > 20) {
      console.log(`... and ${emailList.length - 20} more.`);
    }

    // Save results to a file for verification as requested
    const outputPath = path.join(__dirname, 'registered_emails.json');
    const outputData = {
      total: validEmails.length,
      retrieved_at: new Date().toISOString(),
      emails: validEmails
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`\nFull results recorded in: ${outputPath}`);

  } catch (err) {
    console.error('Database Connection or Query Error:', err.message || err);
    process.exit(1);
  }
}

fetchRegisteredEmails();
