import { NextRequest, NextResponse } from "next/server";
import { getBookingPayments, BookingPaymentFilters } from "@/lib/services/booking-payments";
import { getCurrentUser } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // 1. Authentication Check
    const { user, isAdmin } = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optional: Restrict to admins if necessary
    // if (!isAdmin) { ... }

    // 2. Parse Query Parameters
    const searchParams = req.nextUrl.searchParams;
    
    const filters: BookingPaymentFilters = {
      bookingId: searchParams.get("bookingId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
      customerQuery: searchParams.get("customerQuery") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "10"),
    };

    // 3. Fetch Data
    const result = await getBookingPayments(filters);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("API Error /api/bookings/payments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
