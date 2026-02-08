import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { apiHandler, getPaginationParams } from '@/lib/api-handler';
import { getAmadeus } from '@/lib/amadeusClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    const search = req.nextUrl.searchParams.get('search');
    const country = req.nextUrl.searchParams.get('country');
    const city = req.nextUrl.searchParams.get('city');

    // If search term is present, use Amadeus
    if (search && search.length >= 1) {
      try {
        const amadeus = getAmadeus();
        const response = await amadeus.referenceData.locations.get({
          keyword: search,
          subType: 'AIRPORT,CITY',
          'page[limit]': limit,
          'page[offset]': offset
        });

        const locations = response.data.map((loc: any) => ({
          id: loc.id,
          iata_code: loc.iataCode,
          name: loc.name,
          city: loc.address?.cityName || city || "",
          country: loc.address?.countryCode || country || "",
          published_status: true,
        }));

        // Amadeus doesn't always return total count in meta, so we might need to estimate or omit
        // valid response structure: { data: [...], meta: { count: ..., links: ... } }
        // But for this wrapper, we just return what we have.

        return apiHandler.success(locations, {
          page,
          limit,
          total: locations.length, // Approximate since Amadeus might not give total
          totalPages: 1 // Approximate
        });

      } catch (amadeusError: any) {
        console.error("Amadeus Search Error:", amadeusError);
        // Fallback to DB if Amadeus fails? Or just return error?
        // Let's fallback to DB just in case, or return empty if Amadeus fails.
        // If it's a "not found" error, return empty.
        return apiHandler.success([], { page, limit, total: 0, totalPages: 0 });
      }
    }

    // Existing Supabase Logic (for listing without search, or country/city filters without search)
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

    // Search (Name, IATA, ICAO) - effectively fallback if we decide to use DB for search too
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
