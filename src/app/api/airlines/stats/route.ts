import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const [
    { count: totalCount, error: totalError },
    { count: activeCount, error: activeError },
    { count: inactiveCount, error: inactiveError }
  ] = await Promise.all([
    supabase.from('airlines').select('*', { count: 'exact', head: true }),
    supabase.from('airlines').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('airlines').select('*', { count: 'exact', head: true }).eq('status', 'Inactive')
  ]);

  if (totalError || activeError || inactiveError) {
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
  }

  return NextResponse.json({
    total: totalCount || 0,
    active: activeCount || 0,
    inactive: inactiveCount || 0
  });
}
