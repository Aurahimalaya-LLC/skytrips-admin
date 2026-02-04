import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const priority = searchParams.get('priority');
        const assignedToMe = searchParams.get('assignedToMe') === 'true';

        let query = supabase.from('flight_inquiries').select('*');

        if (status) query = query.eq('status', status);
        if (priority) query = query.eq('priority', priority);
        if (search) {
            query = query.or(`client_name.ilike.%${search}%,inquiry_number.ilike.%${search}%`);
        }

        if (assignedToMe) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) query = query.eq('assignee_id', user.id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return apiHandler.success(data);
    } catch (error) {
        return apiHandler.handleError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const body = await req.json();
        
        const { data, error } = await supabase
            .from('flight_inquiries')
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return apiHandler.success(data, undefined, 'Inquiry created successfully', 201);
    } catch (error) {
        return apiHandler.handleError(error);
    }
}
