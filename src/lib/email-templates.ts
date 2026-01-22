export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "ticket_confirmation",
    name: "Ticket Confirmation",
    subject: "Your Ticket Confirmation - Booking #{PNR}",
    content:
      "Dear {NAME},\n\nPlease find attached your electronic ticket for your upcoming trip.\n\nBooking Reference: {PNR}\n\nSafe travels,\nSkyTrips Team",
  },
  {
    id: "flight_itinerary",
    name: "Flight Itinerary",
    subject: "Flight Itinerary - {ORIGIN} to {DESTINATION}",
    content:
      "Dear {NAME},\n\nHere is the detailed itinerary for your flight.\n\nDeparture: {DEPARTURE_DATE}\nFlight: {FLIGHT_NUMBER}\n\nRegards,\nSkyTrips Team",
  },
  {
    id: "payment_receipt",
    name: "Payment Receipt",
    subject: "Receipt for Booking #{PNR}",
    content:
      "Dear {NAME},\n\nThank you for your payment. Please find the receipt attached.\n\nTotal Amount: {AMOUNT}\n\nRegards,\nSkyTrips Team",
  },
  {
    id: "refund_request_received",
    name: "Refund Request Received",
    subject: "Refund Request Received - Booking #{PNR}",
    content:
      "Dear {NAME},\n\nWe have received your refund request for booking #{PNR}.\n\nOur team is currently reviewing your request. We will notify you once the process is complete or if we need further information.\n\nBest regards,\nSkyTrips Team",
  },
  {
    id: "refund_in_progress",
    name: "Refund In Progress",
    subject: "Refund In Progress - Booking #{PNR}",
    content:
      "Dear {NAME},\n\nYour refund request for booking #{PNR} is now in progress.\n\nWe are working with the airline to process your refund. This typically takes 7-14 business days depending on the airline's policies.\n\nWe will update you as soon as the refund has been approved.\n\nBest regards,\nSkyTrips Team",
  },
];
