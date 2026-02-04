import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-ssr';
import { apiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
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
        const supabase = await createClient();
        const body = await req.json();
        
        const { data, error } = await supabase
            .from('flight_inquiries')
            .insert([body])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data,
            message: 'Inquiry created successfully'
        }, { status: 201 });
    } catch (error) {
        return apiHandler.handleError(error);
    }
}
