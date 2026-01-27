import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;
  const status = searchParams.get("status");

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  let query = supabase
    .from('airlines')
    .select('*', { count: 'exact' });

  if (status && status !== "all") {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getAdminClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
    }

    // Validate required fields
    if (!body.name || !body.iata_code) {
      return NextResponse.json({ error: 'Name and IATA code are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('airlines')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating airline:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
