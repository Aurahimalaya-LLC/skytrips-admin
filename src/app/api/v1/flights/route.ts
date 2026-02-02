import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiHandler, getPaginationParams } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    const origin = req.nextUrl.searchParams.get('origin');
    const destination = req.nextUrl.searchParams.get('destination');
    const slug = req.nextUrl.searchParams.get('slug');

    let query = supabaseAdmin
      .from('routes')
      .select('*', { count: 'exact' });

    // Filtering
    if (origin) {
      query = query.ilike('departure_airport', `%${origin}%`);
    }

    if (destination) {
      query = query.ilike('arrival_airport', `%${destination}%`);
    }

    if (slug) {
      query = query.eq('slug', slug);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return apiHandler.success(data, {
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    return apiHandler.handleError(error);
  }
}
