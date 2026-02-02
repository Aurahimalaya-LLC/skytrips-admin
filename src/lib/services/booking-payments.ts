import { supabase } from "@/lib/supabase";

export interface BookingPaymentDetails {
  booking_id: number;
  booking_created_at: string;
  booking_status: string | null;
  trip_type: string | null;
  flight_class: string | null;
  airlines: string | null;
  origin: string | null;
  destination: string | null;
  departure_date: string | null;
  return_date: string | null;
  pnr: string | null;
  total_booking_amount: number;
  currency: string | null;
  booking_payment_method: string | null;
  booking_payment_status: string | null;
  customer_id: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  payment_id: string | null;
  payment_amount: number | null;
  payment_record_status: string | null;
  payment_date: string | null;
  payment_record_created_at: string | null;
  agency_id: string | null;
  agency_name: string | null;
}

export interface BookingPaymentFilters {
  bookingId?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
  customerQuery?: string; // Search by name or email
  page?: number;
  pageSize?: number;
}

export interface BookingPaymentResponse {
  data: BookingPaymentDetails[];
  count: number;
  error?: string;
}

export const getBookingPayments = async (
  filters: BookingPaymentFilters
): Promise<BookingPaymentResponse> => {
  try {
    const {
      bookingId,
      startDate,
      endDate,
      paymentStatus,
      customerQuery,
      page = 1,
      pageSize = 10,
    } = filters;

    let query = supabase
      .from("view_booking_payments_details")
      .select("*", { count: "exact" });

    // Apply Filters

    if (bookingId) {
      query = query.eq("booking_id", bookingId);
    }

    if (startDate) {
      query = query.gte("booking_created_at", startDate);
    }

    if (endDate) {
      query = query.lte("booking_created_at", endDate);
    }

    if (paymentStatus) {
      // Filter by either booking payment status or payment record status
      query = query.or(
        `booking_payment_status.eq.${paymentStatus},payment_record_status.eq.${paymentStatus}`
      );
    }

    if (customerQuery) {
      query = query.or(
        `customer_name.ilike.%${customerQuery}%,customer_email.ilike.%${customerQuery}%`
      );
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order("booking_created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching booking payments:", error);
      throw error;
    }

    return {
      data: (data as BookingPaymentDetails[]) || [],
      count: count || 0,
    };
  } catch (error) {
    console.error("Service Error getBookingPayments:", error);
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getBookingPaymentById = async (
  bookingId: number
): Promise<BookingPaymentDetails | null> => {
  try {
    const { data, error } = await supabase
      .from("view_booking_payments_details")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (error) {
      throw error;
    }

    return data as BookingPaymentDetails;
  } catch (error) {
    console.error(`Error fetching booking payment ${bookingId}:`, error);
    return null;
  }
};
