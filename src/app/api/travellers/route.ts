import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const { data, error, count } = await supabase
    .from('travellers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const body = await request.json();

  // Temporary fix: Remove issue_country until migration is applied
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { issue_country, ...safeBody } = body;

  const { data, error } = await supabase
    .from('travellers')
    .insert(safeBody)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
