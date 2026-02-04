import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateFlightFareSchema = z.object({
  flight_number: z.string().min(1).optional(),
  departure_airport_code: z.string().length(3).optional(),
  arrival_airport_code: z.string().length(3).optional(),
  departure_time: z.string().datetime().optional(),
  arrival_time: z.string().datetime().optional(),
  airline_code: z.string().min(2).optional(),
  fare_class: z.enum(['Economy', 'Business', 'First']).optional(),
  base_price: z.number().positive().optional(),
  taxes: z.number().nonnegative().optional(),
  availability_status: z.enum(['Available', 'Sold Out', 'Cancelled', 'Expired']).optional(),
  effective_from: z.string().datetime().optional(),
  effective_to: z.string().datetime().optional(),
  version: z.number().int().positive(), // Required for optimistic locking
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    const { data, error } = await supabase
      .from('flight_fares')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return apiHandler.notFound('Flight fare not found');

    return apiHandler.success(data);
  } catch (error) {
    return apiHandler.handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;
    const body = await req.json();
    
    const validatedData = updateFlightFareSchema.parse(body);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiHandler.unauthorized();

    // Optimistic locking is handled by the DB trigger, 
    // but we need to pass the incremented version in the update.
    const { version, ...updateData } = validatedData;

    const { data, error } = await supabase
      .from('flight_fares')
      .update({
        ...updateData,
        version: version + 1,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('version', version) // This ensures optimistic locking at the query level too
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found or version mismatch
        return apiHandler.error('Concurrent update detected or record not found', 409);
      }
      throw error;
    }

    return apiHandler.success(data, null, 'Flight fare updated successfully');
  } catch (error) {
    return apiHandler.handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiHandler.unauthorized();

    const { error } = await supabase
      .from('flight_fares')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return apiHandler.success(null, null, 'Flight fare deleted successfully');
  } catch (error) {
    return apiHandler.handleError(error);
  }
}
