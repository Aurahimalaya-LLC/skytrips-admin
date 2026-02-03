import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('airports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return apiHandler.notFound('Airport not found');
      }
      throw error;
    }

    return apiHandler.success(data);
  } catch (error) {
    return apiHandler.handleError(error);
  }
}
