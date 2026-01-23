import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'upcoming'; // 'upcoming' or 'recent'
    
    // Validate pagination params
    const pageNumber = isNaN(page) || page < 1 ? 1 : page;
    const pageSize = isNaN(limit) || limit < 1 || limit > 100 ? 10 : limit;
    const offset = (pageNumber - 1) * pageSize;

    let query = supabase.from('bookings').select('*', { count: 'exact' });

    const now = new Date();
    const todayStr = now.toISOString();

    if (type === 'upcoming') {
      // Upcoming: departureDate >= today
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30); // Next 30 days
      const futureDateStr = futureDate.toISOString();

      query = query
        .gte('departureDate', todayStr)
        // .lte('departureDate', futureDateStr) // Optional: restrict to 30 days? Let's keep it open or user defined
        .order('departureDate', { ascending: true });
    } else {
      // Recent: created_at descending (newly created bookings)
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error, count } = await query.range(offset, offset + pageSize - 1);

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

    const bookings = data?.map(booking => {
      // Helper to extract customer name from various possible locations
      let customerName = "Unknown Customer";
      
      // 1. Try customer JSON object
      if (booking.customer && typeof booking.customer === 'object') {
        const c = booking.customer;
        if (c.firstName || c.lastName) {
          customerName = `${c.firstName || ''} ${c.lastName || ''}`.trim();
        } else if (c.first_name || c.last_name) {
           customerName = `${c.first_name || ''} ${c.last_name || ''}`.trim();
        }
      }
      
      // 2. Fallback to legacy root fields if still empty or "Unknown Customer"
      if ((!customerName || customerName === "Unknown Customer") && (booking.travellerFirstName || booking.travellerLastName)) {
         customerName = `${booking.travellerFirstName || ''} ${booking.travellerLastName || ''}`.trim();
      }

      // 3. Fallback to customer root fields (if any)
      if ((!customerName || customerName === "Unknown Customer") && (booking.customerFirstName || booking.customerLastName)) {
         customerName = `${booking.customerFirstName || ''} ${booking.customerLastName || ''}`.trim();
      }

      return {
        bookingId: booking.id,
        customerName: customerName || "Unknown",
        bookingDate: booking.departureDate || booking.travelDate || 'N/A', // Fallback
        serviceType: booking.airlines || 'Flight',
        status: booking.status || 'Pending',
        tripType: booking.tripType,
        route: `${booking.origin || 'N/A'} → ${booking.destination || 'N/A'}`,
        origin: booking.origin,
        destination: booking.destination,
        createdAt: booking.created_at
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: {
        page: pageNumber,
        limit: pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        timestamp: new Date().toISOString()
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
