export interface Booking {
  id?: number;
  PNR: string;
  airlines: string;
  origin: string;
  transit: string;
  destination: string;
  tripType: string;
  issueMonth: string;
  IssueDay: string;
  issueYear: string;
  buyingPrice: string;
  costprice?: string;
  sellingPrice?: string;
  prices?: Record<string, string | number>;
  email?: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  dob?: string;
  nationality?: string;
  flightNumber?: string;
  flightClass?: string;
  stopoverLocation?: string;
  frequentFlyer?: string;
  agency?: string;
  handledBy?: string;
  status?: string;
  paymentStatus?: string;
  paymentmethod?: string;
  transactionId?: string;
  dateofpayment?: string;
  payment: string;
  travelDate?: string; // Keeping for backward compatibility if needed, or can be deprecated
  departureDate?: string;
  returnDate?: string;
  arrivalDate?: string;
  passportIssueDate?: string;
  placeOfIssue?: string;
  currency?: string;
  issuedthroughagency?: string;
  travellers?: Traveller[];
  customer?: Customer | number | string;
  customerType?: string;
  contactType?: string;
  addons?: Addons;
  created_at?: string;
  updated_at?: string;
  itineraries?: FlightItinerary[];
}

export interface Addons {
  meals: boolean;
  wheelchair: boolean;
  pickup: boolean;
  dropoff: boolean;
  luggage: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface FlightSegment {
  id?: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  operating?: { carrierCode: string };
  duration?: string;
  numberOfStops?: number;
  blacklistedInEU?: boolean;
}

export interface FlightItinerary {
  duration?: string;
  segments: FlightSegment[];
}

export type BookingStatus = "PENDING" | "SEND" | "REFUNDED";

export interface ManageBooking {
  uid: string;
  booking_id: string | number;
  created_at: string;
  selected_travellers?: string[];
  reason?: string;
  reason_detail?: string;
  refund_status?: string;
  status?: BookingStatus;
  financial_breakdown?: {
    airline_penalty: number;
    agency_fees: number;
    skytrips_fee: number;
    manual_adjustment: number;
    total_refund_amount: number;
    adjustment_reason?: string;
  };
  [key: string]: any;
}

export interface Traveller {
  id?: string; // unique temp id for frontend list management
  firstName: string;
  lastName: string;
  passportNumber?: string;
  passportExpiry?: string;
  dob?: string;
  nationality?: string;
  customerId?: string | number;
  saveToDatabase?: boolean;
  eticketNumber?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Passport {
  number: string;
  expiryDate: string;
  issueCountry: string;
}

export interface Customer {
  id?: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  userType: string;
  isActive: string | boolean;
  country: string;
  address: Address;
  phoneCountryCode: string;
  isDisabled: string | boolean;
  isVerified: string | boolean;
  passport: Passport;
  socialProvider: string;
  socialId: string;
  referralCode: string;
  totalMiles?: number;
  totalSpend?: number;
  lastLogin?: string;
  created_at?: string;
  // New fields from schema enhancement
  preferences?: Record<string, unknown>;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  source?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  marketingConsent?: boolean;
}

export interface Reason {
  id: string;
  code: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
