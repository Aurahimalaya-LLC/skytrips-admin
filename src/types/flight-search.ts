export interface FlightOffer {
  id: string;
  airline: {
    name: string;
    code: string;
    logo?: string;
  };
  flightNumber: string;
  aircraft?: string;
  departure: {
    city: string;
    code: string;
    time: string; // "10:15"
    date?: string;
  };
  arrival: {
    city: string;
    code: string;
    time: string; // "14:00"
    date?: string;
  };
  duration: string; // "7h 45m"
  stops: {
    count: number;
    locations?: string[]; // e.g. ["DOH"]
  };
  price: number;
  currency: string;
  tags?: string[]; // "Refundable", "Seat Choice"
}

export interface FlightFilterState {
  priceRange: [number, number];
  stops: string[]; // "0", "1", "2+"
  airlines: string[];
  departureTime: string[]; // "morning", "afternoon", etc.
}
