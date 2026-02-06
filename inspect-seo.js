require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('Inspecting routes table schema for SEO fields...');
  
  // We want to see if columns exist and what type they are.
  // We can query the information_schema
  
  const { data, error } = await supabase
    .rpc('get_table_columns', { table_name: 'routes' });
    
  if (error) {
      // Fallback if RPC doesn't exist (it usually doesn't by default)
      // Just try to select one row
      const { data: row, error: rowError } = await supabase.from('routes').select('*').limit(1);
      if (rowError) {
          console.error("Error fetching row:", rowError);
      } else if (row && row.length > 0) {
          console.log("Existing columns found in row 1:", Object.keys(row[0]));
      } else {
          console.log("Table exists but is empty. Cannot infer columns easily via select.");
          // We know from previous turns what columns exist:
          // seo_title, meta_description, slug, canonical_url, schema_markup, robots_meta
      }
  }
}

inspectSchema();
