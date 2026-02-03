
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkColumns() {
  const { getAdminClient } = await import("@/lib/supabase-server");
  const supabase = getAdminClient();
  if (!supabase) return;

  const { data: columns } = await supabase.rpc('get_table_columns', { table_name: 'bookings' });
  console.log("Columns in bookings:", columns);
  
  // Alternative if RPC not available:
  const { data: sample } = await supabase.from("bookings").select("*").limit(1);
  if (sample && sample[0]) {
    console.log("Sample booking keys:", Object.keys(sample[0]));
  }
}

checkColumns();
