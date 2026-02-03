import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function seedPayments() {
  console.log('🌱 Seeding payments from existing bookings...');
  
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, sellingPrice, sellingprice')
    .limit(5);

  if (error) {
    console.error('Error fetching bookings:', error);
    return;
  }

  for (const booking of bookings) {
    const amount = booking.sellingPrice || booking.sellingprice || 100;
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        amount: amount,
        payment_status: 'Completed',
        payment_date: new Date().toISOString()
      });

    if (insertError) {
      console.error(`Error inserting payment for booking ${booking.id}:`, insertError.message);
    } else {
      console.log(`✅ Seeded payment for booking ${booking.id}`);
    }
  }
}

seedPayments();
