
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabase.from('bookings').select('sellingPrice');

    if (from && to) {
      query = query.gte('created_at', from).lte('created_at', to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch booking data', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    let totalRevenue = 0;

    if (data) {
      totalRevenue = data.reduce((sum, booking) => {
        const price = booking.sellingPrice;
        if (!price) return sum;
        if (typeof price === 'number') return sum + price;
        // Handle string like "$1,234.56" or "1234.56"
        const num = parseFloat(price.replace(/[^0-9.-]+/g, ""));
        return sum + (isNaN(num) ? 0 : num);
      }, 0);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue
      }
    });

  } catch (err: unknown) {
    console.error('API Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
