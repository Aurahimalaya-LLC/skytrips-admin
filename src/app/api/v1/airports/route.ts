import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiHandler, getPaginationParams } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    const search = req.nextUrl.searchParams.get('search');
    const country = req.nextUrl.searchParams.get('country');
    const city = req.nextUrl.searchParams.get('city');

    let query = supabaseAdmin
      .from('airports')
      .select('*', { count: 'exact' });

    // Filtering
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    // Search (Name, IATA, ICAO)
    if (search) {
      query = query.or(`name.ilike.%${search}%,iata_code.ilike.%${search}%,icao_code.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1).order('name', { ascending: true });

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
