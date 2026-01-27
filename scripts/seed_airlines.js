
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Could not read .env.local file');
  process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAirlines() {
  console.log('Starting airlines seed...');
  
  // Load airlines from JSON
  const airlinesPath = path.join(process.cwd(), 'libs/shared-utils/constants/airline.json');
  let airlinesData;
  try {
    const content = fs.readFileSync(airlinesPath, 'utf8');
    airlinesData = JSON.parse(content);
  } catch (e) {
    console.error('Could not read airline.json');
    process.exit(1);
  }

  // Filter and map data to match table schema
  // Schema: name, iata_code, country, commission_rate, logo_url, status
  const airlinesToInsert = airlinesData.airlinecodes
    .filter(a => a.active === 'Y' && a.iata && a.iata !== '-' && a.iata !== '\\N')
    // Removed slice to import all valid airlines
    .map(a => ({
      name: a.name,
      iata_code: a.iata,
      country: a.country || 'Unknown',
      commission_rate: (Math.random() * 5 + 1).toFixed(1), // Random commission between 1% and 6%
      logo_url: a.logo,
      status: 'Active'
    }));

  console.log(`Prepared ${airlinesToInsert.length} airlines for insertion.`);

  // Check if table exists by trying to select
  const { error: checkError } = await supabase.from('airlines').select('count').limit(1);
  
  if (checkError) {
    console.error('Error accessing airlines table:', checkError.message);
    if (checkError.message.includes('relation "airlines" does not exist') || checkError.message.includes('column') ) {
        console.error('CRITICAL: Database schema issue detected. Please run the migration SQL: supabase/migrations/20260127_recreate_airlines_table.sql');
    }
    return;
  }

  // Clear existing data (optional, but good for idempotent seeding)
  console.log('Clearing existing data...');
  await supabase.from('airlines').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 

  // Insert data in batches
  const batchSize = 50; // Increased batch size for faster insertion
  for (let i = 0; i < airlinesToInsert.length; i += batchSize) {
    const batch = airlinesToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('airlines').insert(batch);
    if (error) {
      console.error(`Error inserting batch starting at index ${i}:`, error.message);
    } else {
      process.stdout.write(`\rInserted ${Math.min(i + batchSize, airlinesToInsert.length)} / ${airlinesToInsert.length} airlines...`);
    }
  }
  console.log('\nSeeding completed.');
}

seedAirlines();
