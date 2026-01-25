const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjrmemmsieltajotxddk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_GxUlFYif0EEYIEYCEkqIGg_Xee1B4qZ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  try {
    console.log("Checking columns for 'bookings' table...");
    
    // We can't directly query information_schema easily with just anon key usually, 
    // but we can try to select a single row and see keys, or assume success.
    // However, the error "Could not find the 'paymentMethod' column" usually comes from the client 
    // validation against its local schema cache or PostgREST error.
    
    // Let's try to insert a dummy record with paymentMethod and see the error,
    // or select it.
    
    const { data, error } = await supabase
      .from('bookings')
      .select('paymentMethod')
      .limit(1);

    if (error) {
        console.error("Error selecting paymentMethod:", error.message);
        if (error.message.includes('does not exist') || error.code === 'PGRST204' || error.code === '42703') {
            console.log("Column 'paymentMethod' likely missing.");
        }
    } else {
        console.log("Column 'paymentMethod' exists. Data:", data);
    }

  } catch (err) {
    console.error("Script error:", err);
  }
}

checkColumns();
