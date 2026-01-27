import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  // We need to count two groups:
  // 1. Complete profiles (all relevant fields filled)
  // 2. Incomplete profiles (at least one missing)
  // Relevant fields from the current form: title, first_name, last_name, passport_number, passport_expiry, dob, nationality, gender

  // We can fetch all and count in JS, or use SQL. 
  // Since we don't have a complex "CASE WHEN" via the JS client easily without raw SQL (RPC), 
  // and we might have many records, let's try to do it efficiently.
  // But standard supabase client doesn't support advanced aggregation easily without RPC.
  // For now, let's fetch specific columns and count in memory if the dataset isn't huge, 
  // OR make two count queries.
  
  // Query 1: Total count
  const { count: totalCount, error: countError } = await supabase
    .from('travellers')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Query 2: Count of complete profiles
  // We can filter where NOT (field is null).
  // Note: supabase .not(column, 'is', null)
  
  const { count: completeCount, error: completeError } = await supabase
    .from('travellers')
    .select('*', { count: 'exact', head: true })
    .not('title', 'is', null)
    .not('first_name', 'is', null)
    .not('last_name', 'is', null)
    .not('passport_number', 'is', null)
    .not('passport_expiry', 'is', null)
    .not('dob', 'is', null)
    .not('nationality', 'is', null)
    .not('gender', 'is', null);
    // Note: Empty strings might be an issue if the DB stores them instead of NULL. 
    // But typically with the form handling, we might want to check for non-empty.
    // The standard PostgREST doesn't have "is not empty string" easily combined with IS NOT NULL in one clean go without ORs which are tricky.
    // Let's assume for now "filled" means NOT NULL.

  if (completeError) {
    return NextResponse.json({ error: completeError.message }, { status: 500 });
  }

  const incompleteCount = (totalCount || 0) - (completeCount || 0);

  return NextResponse.json({
    total: totalCount || 0,
    complete: completeCount || 0,
    incomplete: incompleteCount || 0
  });
}
