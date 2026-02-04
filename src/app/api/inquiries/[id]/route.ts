import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { id } = params;
        const body = await req.json();

        const { data, error } = await supabase
            .from('flight_inquiries')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return apiHandler.success(data, undefined, 'Inquiry updated successfully');
    } catch (error) {
        return apiHandler.handleError(error);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { id } = params;

        const { error } = await supabase
            .from('flight_inquiries')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return apiHandler.success(null, undefined, 'Inquiry deleted successfully');
    } catch (error) {
        return apiHandler.handleError(error);
    }
}
