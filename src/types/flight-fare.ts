export type AvailabilityStatus = 'Available' | 'Sold Out' | 'Cancelled' | 'Expired';
export type FareClass = 'Economy' | 'Business' | 'First';

export interface FlightFare {
  id: string;
  flight_number: string;
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_time: string;
  arrival_time: string;
  airline_code: string;
  fare_class: FareClass;
  base_price: number;
  taxes: number;
  total_price: number;
  availability_status: AvailabilityStatus;
  effective_from: string;
  effective_to?: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface FlightFareAuditLog {
  id: string;
  fare_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  old_data?: Partial<FlightFare>;
  new_data?: Partial<FlightFare>;
  changed_by?: string;
  changed_at: string;
}
