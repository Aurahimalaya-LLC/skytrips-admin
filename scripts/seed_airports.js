const { createClient } = require("@supabase/supabase-js");
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
    console.log("Loading airport data...");
    const airports = JSON.parse(fs.readFileSync(path.join(__dirname, '../libs/shared-utils/constants/airport.json'), 'utf8'));
    console.log(`Loaded ${airports.length} airports.`);

    // Clear existing data to avoid duplicates or start fresh
    console.log("Clearing existing airports...");
    const { error: delError } = await supabase.from('airports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) console.error("Error clearing airports:", delError.message);

    const batchSize = 100;
    for (let i = 0; i < airports.length; i += batchSize) {
        const batch = airports.slice(i, i + batchSize).map(a => ({
            name: a.name,
            iata_code: a.IATA && a.IATA !== '-' ? a.IATA : null,
            code: a.IATA && a.IATA !== '-' ? a.IATA : null,
            icao_code: a.ICAO && a.ICAO !== '-' ? a.ICAO : null,
            city: a.city,
            country: a.country,
            latitude: a.lat ? parseFloat(a.lat) : null,
            longitude: a.lon ? parseFloat(a.lon) : null,
            timezone: a.timezone
        }));

        const { error } = await supabase.from('airports').insert(batch);
        if (error) {
            console.error(`Error inserting batch ${i / batchSize}:`, error.message);
        } else {
            process.stdout.write(`\rInserted ${Math.min(i + batchSize, airports.length)} / ${airports.length} airports...`);
        }
    }
    console.log("\nSeeding complete!");
}

seed();
