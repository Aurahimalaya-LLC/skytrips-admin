import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    .update(safeBody)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const { error } = await supabase
    .from('travellers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Traveller deleted successfully' });
}
