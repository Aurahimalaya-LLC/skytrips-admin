import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-ssr';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from('flight_inquiries')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return apiHandler.success(data);
    } catch (error) {
        return apiHandler.handleError(error);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { error } = await supabase
            .from('flight_inquiries')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return apiHandler.success(null);
    } catch (error) {
        return apiHandler.handleError(error);
    }
}
