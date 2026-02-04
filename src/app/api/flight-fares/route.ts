import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { apiHandler, getPaginationParams } from '@/lib/api-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const flightFareSchema = z.object({
  flight_number: z.string().min(1),
  departure_airport_code: z.string().length(3),
  arrival_airport_code: z.string().length(3),
  departure_time: z.string().datetime(),
  arrival_time: z.string().datetime(),
  airline_code: z.string().min(2),
  fare_class: z.enum(['Economy', 'Business', 'First']),
  base_price: z.number().positive(),
  taxes: z.number().nonnegative().default(0),
  availability_status: z.enum(['Available', 'Sold Out', 'Cancelled', 'Expired']).default('Available'),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { page, limit, offset } = getPaginationParams(req.nextUrl);
    
    const departure = req.nextUrl.searchParams.get('departure');
    const arrival = req.nextUrl.searchParams.get('arrival');
    const airline = req.nextUrl.searchParams.get('airline');
    const minPrice = req.nextUrl.searchParams.get('minPrice');
    const maxPrice = req.nextUrl.searchParams.get('maxPrice');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');
    const sortBy = req.nextUrl.searchParams.get('sortBy') || 'created_at';
    const sortOrder = req.nextUrl.searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('flight_fares')
      .select('*', { count: 'exact' });

    if (departure) query = query.ilike('departure_airport_code', `%${departure}%`);
    if (arrival) query = query.ilike('arrival_airport_code', `%${arrival}%`);
    if (airline) query = query.ilike('airline_code', `%${airline}%`);
    if (minPrice) query = query.gte('total_price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('total_price', parseFloat(maxPrice));
    if (startDate) query = query.gte('departure_time', startDate);
    if (endDate) query = query.lte('departure_time', endDate);

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return apiHandler.success(data, {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return apiHandler.handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await req.json();
    
    const validatedData = flightFareSchema.parse(body);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiHandler.unauthorized();

    const { data, error } = await supabase
      .from('flight_fares')
      .insert([{
        ...validatedData,
        created_by: user.id,
        updated_by: user.id
      }])
      .select()
      .single();

    if (error) throw error;

    return apiHandler.success(data, null, 'Flight fare created successfully', 201);
  } catch (error) {
    return apiHandler.handleError(error);
  }
}
