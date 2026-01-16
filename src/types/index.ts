export interface Booking {
  id?: number;
  travellerFirstName: string;
  travellerLastName: string;
  PNR: string;
  ticketNumber: string;
  airlines: string;
  origin: string;
  transit: string;
  destination: string;
  tripType: string;
  issueMonth: string;
  IssueDay: string;
  issueYear: string;
  buyingPrice: string;
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
  paymentMethod?: string;
  transactionId?: string;
  dateOfPayment?: string;
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
  customer?: Customer;
  created_at?: string;
  updated_at?: string;
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
  id?: number;
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

export interface ManageBooking {
  uid: string;
  booking_id: string;
  created_at: string;
  updated_at?: string | null;
}
