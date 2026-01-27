import { getAdminClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('airlines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching airline:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: airlineId } = await params;
    const body = await request.json();
    const supabase = getAdminClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
    }

    // Remove id and created_at from body if present to avoid updating them
    const { id, created_at, ...updateData } = body;

    const { data, error } = await supabase
      .from('airlines')
      .update(updateData)
      .eq('id', airlineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating airline:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getAdminClient();
  
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client configuration missing' }, { status: 500 });
  }

  const { error } = await supabase
    .from('airlines')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting airline:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
