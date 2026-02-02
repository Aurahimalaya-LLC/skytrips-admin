
export interface RouteFAQ {
  question: string;
  answer: string;
}

export interface RouteDoc {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  category: "Authentication" | "Dashboard" | "Flights" | "Bookings" | "Customers" | "Agencies" | "System";
  faqs: RouteFAQ[];
}

export const routeDocs: RouteDoc[] = [
  // --- Authentication ---
  {
    id: "auth-login-page",
    path: "/portal/auth/login",
    method: "GET",
    description: "User login interface for accessing the portal.",
    category: "Authentication",
    faqs: [
      {
        question: "What credentials are required?",
        answer: "Users must provide their registered email address and password. If 2FA is enabled, an OTP will also be required."
      },
      {
        question: "How do I reset my password?",
        answer: "Click the 'Forgot Password' link on the login form to initiate the password reset flow via email."
      },
      {
        question: "What happens after successful login?",
        answer: "The user is redirected to their respective dashboard (Admin or Agent) based on their role."
      }
    ]
  },
  {
    id: "api-auth-login",
    path: "/api/auth/login",
    method: "POST",
    description: "Backend endpoint to authenticate users and issue session tokens.",
    category: "Authentication",
    faqs: [
      {
        question: "What is the required payload?",
        answer: "JSON object containing `email` and `password`."
      },
      {
        question: "What does the response contain?",
        answer: "On success: 200 OK with a session cookie/token and user profile data. On failure: 401 Unauthorized."
      },
      {
        question: "Is there rate limiting?",
        answer: "Yes, multiple failed attempts will temporarily block the IP address to prevent brute-force attacks."
      }
    ]
  },

  // --- Dashboard ---
  {
    id: "dashboard-main",
    path: "/dashboard",
    method: "GET",
    description: "Main administrative dashboard overview displaying key metrics and charts.",
    category: "Dashboard",
    faqs: [
      {
        question: "What metrics are displayed?",
        answer: "Daily booking counts, revenue overview, active users, and recent activity logs."
      },
      {
        question: "Can I customize the widgets?",
        answer: "Currently, the layout is fixed, but date ranges for metrics can be adjusted."
      },
      {
        question: "Who has access to this page?",
        answer: "Only users with 'Admin' or 'Manager' roles can view the full dashboard statistics."
      }
    ]
  },

  // --- Bookings ---
  {
    id: "dashboard-bookings",
    path: "/dashboard/booking",
    method: "GET",
    description: "List view of all flight bookings with filtering and management options.",
    category: "Bookings",
    faqs: [
      {
        question: "How can I filter bookings?",
        answer: "You can filter by status (Confirmed, Pending, Cancelled), date range, and airline."
      },
      {
        question: "Can I export booking data?",
        answer: "Yes, there is an 'Export CSV' button at the top right of the table."
      },
      {
        question: "How do I view booking details?",
        answer: "Click on the booking reference ID (PNR) to navigate to the detailed view."
      }
    ]
  },
  {
    id: "api-amadeus-book",
    path: "/api/amadeus/book",
    method: "POST",
    description: "Executes a flight booking order via the Amadeus GDS.",
    category: "Bookings",
    faqs: [
      {
        question: "What data is needed to book?",
        answer: "A valid flight offer ID and traveler details (names, passport info, contact details)."
      },
      {
        question: "Does this charge the payment method?",
        answer: "Yes, this endpoint triggers the payment processing before confirming the PNR with Amadeus."
      },
      {
        question: "What if the flight price changes?",
        answer: "The API will return a 409 Conflict error with the new price, requiring the user to re-confirm."
      }
    ]
  },

  // --- Flights ---
  {
    id: "api-v1-flights-search",
    path: "/api/v1/flights",
    method: "GET",
    description: "Search for available flights based on origin, destination, and dates.",
    category: "Flights",
    faqs: [
      {
        question: "What are the mandatory query parameters?",
        answer: "`origin` (IATA code), `destination` (IATA code), and `departureDate` (YYYY-MM-DD)."
      },
      {
        question: "How are results sorted?",
        answer: "By default, results are sorted by price (lowest first). You can also sort by duration or departure time."
      },
      {
        question: "Does it support multi-city search?",
        answer: "Currently, only one-way and round-trip searches are supported via this endpoint."
      }
    ]
  },

  // --- Agencies ---
  {
    id: "dashboard-agencies",
    path: "/dashboard/agencies",
    method: "GET",
    description: "Management interface for B2B agency partners.",
    category: "Agencies",
    faqs: [
      {
        question: "How do I add a new agency?",
        answer: "Click the 'Add Agency' button and fill in the company details, contact info, and commission structure."
      },
      {
        question: "Where can I see agency performance?",
        answer: "Each agency row has a 'Stats' button that opens a detailed performance report."
      },
      {
        question: "Can I suspend an agency?",
        answer: "Yes, use the action menu on the agency's row to change their status to 'Suspended'."
      }
    ]
  },
  {
    id: "api-agencies-stats",
    path: "/api/agencies/stats",
    method: "GET",
    description: "Retrieves aggregated performance statistics for agencies.",
    category: "Agencies",
    faqs: [
      {
        question: "What time period does this cover?",
        answer: "Defaults to the last 30 days unless `startDate` and `endDate` parameters are provided."
      },
      {
        question: "What metrics are included?",
        answer: "Total bookings, total revenue, commission earned, and cancellation rate."
      },
      {
        question: "Can I get stats for a specific agency?",
        answer: "Yes, pass the `agencyId` query parameter to filter results for a single entity."
      }
    ]
  }
];
