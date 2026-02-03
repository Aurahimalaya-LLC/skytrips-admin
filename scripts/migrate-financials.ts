import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for migration

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePayment(payment_id: string, cp: number, sp: number) {
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      cost_price: cp,
      selling_price: sp,
      updated_at: new Date().toISOString()
    })
    .eq('payment_id', payment_id);

  if (updateError) {
    throw updateError;
  }
}

async function migrateFinancials() {
  console.log('🚀 Starting Data Migration: Copying CP and SP from Bookings to Payments...');
  
  let successCount = 0;
  let failureCount = 0;
  const skippedCount = 0;
  const errors: Record<string, unknown>[] = [];

  try {
    // 1. Fetch all payment records
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('payment_id, booking_id');

    if (paymentsError) throw paymentsError;

    if (!payments || payments.length === 0) {
      console.log('ℹ️ No payment records found to migrate.');
      return;
    }

    console.log(`📦 Found ${payments.length} payment records. Processing...`);

    // 2. Process each payment record
    for (const payment of payments) {
      try {
        // Fetch corresponding booking financials
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('buyingPrice, sellingPrice, costprice, sellingprice')
          .eq('id', payment.booking_id)
          .single();

        if (bookingError) {
          // If columns missing, try fetching all and picking
          const { data: bookingAll, error: allErr } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', payment.booking_id)
            .single();
          
          if (allErr) {
            console.error(`❌ Error fetching booking ${payment.booking_id}:`, allErr.message);
            failureCount++;
            errors.push({ payment_id: payment.payment_id, booking_id: payment.booking_id, error: allErr.message });
            continue;
          }
          
          const bookingData = bookingAll as Record<string, unknown>;
          const cp = (bookingData.buyingPrice as number) || (bookingData.costprice as number) || 0;
          const sp = (bookingData.sellingPrice as number) || (bookingData.sellingprice as number) || 0;
          
          await updatePayment(payment.payment_id, cp, sp);
          successCount++;
        } else {
          const bookingData = booking as Record<string, unknown>;
          const cp = (bookingData.buyingPrice as number) || (bookingData.costprice as number) || 0;
          const sp = (bookingData.sellingPrice as number) || (bookingData.sellingprice as number) || 0;
          await updatePayment(payment.payment_id, cp, sp);
          successCount++;
        }
        if (successCount % 10 === 0 && successCount > 0) console.log(`✅ Progress: ${successCount} records updated...`);
      } catch (innerError: unknown) {
        const message = innerError instanceof Error ? innerError.message : JSON.stringify(innerError);
        console.error(`💥 Unexpected error processing payment ${payment.payment_id}:`, message);
        failureCount++;
        errors.push({ payment_id: payment.payment_id, error: message });
      }
    }

    // 4. Validation Check
    console.log('\n🔍 Running Validation Check...');
    const { data: validationData, error: validationError } = await supabase
      .from('payments')
      .select('payment_id, cost_price, selling_price')
      .limit(5);

    if (validationError) {
      console.error('❌ Validation failed:', validationError.message);
    } else {
      console.log('✅ Validation Sample:', validationData);
    }

    // 5. Summary Report
    console.log('\n--- 📊 Migration Summary Report ---');
    console.log(`✅ Successfully Updated: ${successCount}`);
    console.log(`❌ Failed:             ${failureCount}`);
    console.log(`⏭️ Skipped:            ${skippedCount}`);
    console.log(`Total Processed:       ${successCount + failureCount + skippedCount}`);
    
    if (errors.length > 0) {
      console.log('\n--- 🛠️ Error Details ---');
      errors.slice(0, 10).forEach(err => console.log(JSON.stringify(err)));
      if (errors.length > 10) console.log(`... and ${errors.length - 10} more errors.`);
    }

  } catch (globalError: unknown) {
    const message = globalError instanceof Error ? globalError.message : String(globalError);
    console.error('🛑 Critical Migration Error:', message);
  } finally {
    console.log('\n🏁 Migration script finished.');
  }
}

migrateFinancials();
