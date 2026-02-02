import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Ensure this exists or use appropriate client
import { apiHandler, getPaginationParams } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    const search = req.nextUrl.searchParams.get('search');
    const country = req.nextUrl.searchParams.get('country');
    const status = req.nextUrl.searchParams.get('status');

    let query = supabaseAdmin
      .from('airlines')
      .select('*', { count: 'exact' });

    // Filtering
    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.eq('status', 'Active'); // Default to Active
    }

    if (country) {
      query = query.ilike('country', `%${country}%`);
    }

    // Search (Name or IATA)
    if (search) {
      query = query.or(`name.ilike.%${search}%,iata_code.ilike.%${search}%`);
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
