// Script to verify environment configuration
// Run with: node scripts/verify-env.js

const fs = require('fs');
const path = require('path');

const requiredClientVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const requiredServerVars = [
  'SUPABASE_SERVICE_ROLE_KEY'
];

// Simple .env parser
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
      env[key] = value;
    }
  });
  return env;
}

function checkEnv() {
  console.log('Verifying environment configuration...\n');
  
  // Load env vars from .env.local
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  const envLocal = parseEnv(envLocalPath);
  
  // Merge with process.env (process.env takes precedence if set)
  const env = { ...envLocal, ...process.env };

  let hasError = false;

  // Check client vars
  console.log('Client-side variables:');
  requiredClientVars.forEach(key => {
    if (env[key]) {
      console.log(`  ✅ ${key} is set`);
    } else {
      console.log(`  ❌ ${key} is MISSING`);
      hasError = true;
    }
  });

  console.log('\nServer-side variables:');
  requiredServerVars.forEach(key => {
    if (env[key]) {
      console.log(`  ✅ ${key} is set`);
    } else {
      console.log(`  ❌ ${key} is MISSING`);
      hasError = true;
    }
  });

  console.log('\n');
  if (hasError) {
    console.error('Configuration validation failed. Please check your .env.local file.');
    if (!env['SUPABASE_SERVICE_ROLE_KEY']) {
        console.log('\nNOTE: SUPABASE_SERVICE_ROLE_KEY is required for admin features.');
        console.log('You can find it in Supabase Dashboard > Settings > API > service_role secret.');
    }
    process.exit(1);
  } else {
    console.log('Configuration validation passed.');
  }
}

checkEnv();
