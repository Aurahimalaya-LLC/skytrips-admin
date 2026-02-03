export interface Payment {
  payment_id: string;
  booking_id: number;
  created_date: string; // ISO string
  customer_name: string;
  selling_price: number;
  cost_price?: number;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'; // Adjust based on actual values
  amount: number;
  payment_date: string; // ISO string
  agency_name: string | null;
  cp: string | null; // Contact Phone
  contact_person: string | null;
  payment_source: 'Customer' | 'Agency';
  customer_json?: Record<string, unknown>;
  travellers_json?: unknown[];
}

export interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export type SortField = 'created_date' | 'amount' | 'selling_price' | 'payment_date' | 'status' | 'payment_id' | 'booking_id';
export type SortOrder = 'asc' | 'desc';
