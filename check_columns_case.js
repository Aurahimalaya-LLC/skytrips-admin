const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjrmemmsieltajotxddk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GxUlFYif0EEYIEYCEkqIGg_Xee1B4qZ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    console.log("Checking columns...");
    // Try selecting both to see which one doesn't error, or if both exist
    const { data, error } = await supabase
      .from('bookings')
      .select('paymentMethod, paymentmethod')
      .limit(1);

    if (error) {
        console.log("Error selecting columns:", error.message);
    } else {
        console.log("Both columns might exist (or just the valid ones returned)? Data:", data);
        // If data returns keys, we know which one exists
        if (data.length > 0) {
            console.log("Keys found:", Object.keys(data[0]));
        } else {
             // Insert a dummy row to check keys returned
             console.log("No data found, trying to infer from error on single select");
        }
    }
    
    // Check individually to be sure
    const { error: err1 } = await supabase.from('bookings').select('paymentMethod').limit(1);
    console.log("paymentMethod (camelCase) exists:", !err1);

    const { error: err2 } = await supabase.from('bookings').select('paymentmethod').limit(1);
    console.log("paymentmethod (lowercase) exists:", !err2);

  } catch (err) {
    console.error(err);
  }
}

checkColumns();
