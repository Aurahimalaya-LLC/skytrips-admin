const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches user email addresses from a specified table.
 * 
 * @param {string} tableName - The table to query (e.g., 'customers' or 'users')
 * @param {string} sortBy - The field to sort by ('email' or 'created_at')
 */
async function getUserEmails(tableName = 'customers', sortBy = 'email') {
  console.log(`\n🔍 Starting retrieval from table: "${tableName}"...`);
  console.log(`📊 Sorting by: ${sortBy}`);

  try {
    // 1. Database Query with error handling
    // We select only the email and the sorting field
    const selectFields = ['email'];
    if (sortBy !== 'email') selectFields.push(sortBy);

    const { data, error } = await supabase
      .from(tableName)
      .select(selectFields.join(','))
      .not('email', 'is', null)
      .neq('email', '')
      .order(sortBy, { ascending: true });

    if (error) {
      throw new Error(`Database query failed: ${error.message} (Code: ${error.code})`);
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No registered users found with valid emails.');
      return;
    }

    // 2. Filter and Validate Emails
    // Using a more robust regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validResults = data.filter(item => {
      const email = item.email ? item.email.trim() : '';
      return emailRegex.test(email);
    });

    const uniqueEmails = [...new Set(validResults.map(item => item.email.toLowerCase().trim()))];

    console.log(`✅ Successfully retrieved ${uniqueEmails.length} valid unique email addresses (out of ${data.length} records).`);

    // 3. Record Results for Verification
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = `user_emails_export_${tableName}_${timestamp}.json`;
    const resultPath = path.resolve(__dirname, `../results/${resultFile}`);

    // Ensure results directory exists
    const resultsDir = path.resolve(__dirname, '../results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    const output = {
      table: tableName,
      count: uniqueEmails.length,
      retrieved_at: new Date().toISOString(),
      sortBy: sortBy,
      emails: uniqueEmails
    };

    fs.writeFileSync(resultPath, JSON.stringify(output, null, 2));
    console.log(`📝 Results recorded in: ${resultPath}`);

    // Log the first 10 for quick verification
    console.log('\n--- Preview (First 10 Emails) ---');
    console.log(uniqueEmails.slice(0, 10).join('\n'));
    if (uniqueEmails.length > 10) {
      console.log(`... and ${uniqueEmails.length - 10} more.`);
    }

  } catch (err) {
    console.error(`\n❌ Critical Error: ${err.message}`);
    // Handle timeout or connection errors specifically if needed
    if (err.message.includes('timeout') || err.message.includes('fetch')) {
      console.error('💡 Suggestion: Check your internet connection or Supabase service status.');
    }
  }
}

// Execute the operation
// Defaulting to 'customers' as it is the primary user table in this project
const targetTable = process.argv[2] || 'customers';
const sortOrder = process.argv[3] || 'email';

getUserEmails(targetTable, sortOrder);
