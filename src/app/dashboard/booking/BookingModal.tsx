"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import AirlineAutocomplete from "@/components/AirlineAutocomplete";
import CustomerSearch from "@/components/CustomerSearch";
import TravellerSearch from "@/components/TravellerSearch";
import MultiStepProgress from "@/components/common/MultiStepProgress";
import countryData from "../../../../libs/shared-utils/constants/country.json";
import {
  Booking,
  Customer,
  Traveller,
  FlightItinerary,
  FlightSegment,
  Addons,
} from "@/types";
import NotificationConfirmModal from "@/components/NotificationConfirmModal";

type Agency = {
  uid: string;
  agency_name: string;
  status: string;
};

interface AppUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
  created_at?: string;
}

interface DBTraveller {
  id: string;
  first_name: string;
  last_name: string;
  passport_number?: string;
  passport_expiry?: string;
  dob?: string;
  nationality?: string;
  customer_id?: string | number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Partial<Booking>) => Promise<void>;
  onEdit?: () => void;
  booking: Booking | null;
  isLoading: boolean;
  isReadOnly?: boolean;
}

interface Prices {
  meals: string;
  wheelchair: string;
  pickup: string;
  dropoff: string;
  luggage: string;
  [key: string]: string;
}

interface FormData {
  email: string;
  phone: string;
  travellers: Traveller[]; // Array of travellers
  travellerFirstName: string; // Deprecated
  travellerLastName: string; // Deprecated
  customerFirstName: string; // New: for Customer Contact Details
  customerLastName: string; // New: for Customer Contact Details
  passportNumber: string; // Deprecated
  passportExpiry: string; // Deprecated
  nationality: string; // Deprecated
  dob: string; // Deprecated
  tripType: string;
  travelDate: string;
  returnDate?: string;
  origin: string;
  destination: string;
  transit: string;
  airlines: string;
  flightNumber: string;
  flightClass: string;
  frequentFlyer: string;
  pnr: string;
  ticketNumber: string;
  issueMonth: string;
  IssueDay: string;
  issueYear: string;
  agency: string;
  handledBy: string;
  status: string;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  buyingPrice: string;
  costPrice: string;
  sellingPrice: string;
  payment: string;
  stopoverLocation?: string;
  stopoverArrival?: string;
  stopoverDeparture?: string;
  addons: Addons;
  prices: Prices;
  customerType: string;
  contactType: string;
  itineraries: FlightItinerary[];
}

export default function BookingModal({
  isOpen,
  onClose,
  onSave,
  onEdit,
  booking,
  isLoading,
  isReadOnly = false,
}: BookingModalProps) {
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [showStopover, setShowStopover] = useState(false);
  const [searchingTravellerIndex, setSearchingTravellerIndex] = useState<
    number | null
  >(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Fetch current user and set it as handledBy
  useEffect(() => {
    const fetchCurrentUser = async () => {
      let nameToUse = "System User";

      // 1. Try localStorage first (fastest and requested by user)
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("sky_admin_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.name) nameToUse = parsed.name;
            else if (parsed.email) nameToUse = parsed.email;
          }
        } catch (e) {
          console.error("Error reading user from localStorage", e);
        }
      }

      // 2. Try Supabase Auth as fallback/enhancement
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Try to get more details from public.users
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userData) {
          setCurrentUser(userData);
          // If we didn't get a good name from localStorage, try DB
          if (nameToUse === "System User" || nameToUse === user.email) {
            const fullName =
              `${userData.first_name || ""} ${userData.last_name || ""}`.trim();
            if (fullName) nameToUse = fullName;
            else if (userData.email) nameToUse = userData.email;
          }
        }
      }

      if (!booking) {
        // Only set default for new bookings
        setFormData((prev) => ({
          ...prev,
          handledBy: nameToUse,
        }));
      }
    };
    fetchCurrentUser();
  }, [booking]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      // Contact Details Validation
      if (!formData.email || !formData.phone) {
        alert("Please provide both email and phone number for the customer.");
        return false;
      }
      if (formData.contactType === "new" && (!formData.customerFirstName || !formData.customerLastName)) {
        alert("Please provide the customer's first and last name.");
        return false;
      }
    }

    if (stepIndex === 1) {
      // Traveller Information Validation
      if (formData.travellers.length === 0) {
        alert("Please add at least one traveller.");
        return false;
      }
      const invalidTraveller = formData.travellers.find(t => !t.firstName || !t.lastName);
      if (invalidTraveller) {
        alert("Please ensure all travellers have a first and last name.");
        return false;
      }
    }

    if (stepIndex === 2) {
      // Route Details Validation
      if (!formData.origin || !formData.destination || !formData.travelDate || !formData.airlines) {
        alert("Please complete all required route details (Origin, Destination, Departure Date, and Airline).");
        return false;
      }
      if (formData.tripType === "Round Trip" && !formData.returnDate) {
        alert("Please provide a return date for your round trip.");
        return false;
      }
    }

    return true;
  };

  const handleStepChange = (newStep: number) => {
    // Only validate when moving forward
    if (newStep > currentStep) {
      // Validate all steps between current and target
      for (let i = currentStep; i < newStep; i++) {
        if (!validateStep(i)) return;
      }
    }
    setCurrentStep(newStep);
  };

  const steps = [
    { id: "contact", name: "Contact Details" },
    { id: "traveller", name: "Traveller Info" },
    { id: "route", name: "Route Details" },
    { id: "addons", name: "Add-ons" },
    { id: "review", name: "Review & Save" },
  ];

  const [formData, setFormData] = useState<FormData>({
    email: "sarita.p@example.com",
    phone: "+61 412 345 678",
    travellers: [],
    travellerFirstName: "",
    travellerLastName: "",
    customerFirstName: "",
    customerLastName: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "Nepalese",
    dob: "1985-03-15",
    tripType: "One Way",
    travelDate: "",
    returnDate: "",
    origin: "",
    destination: "",
    transit: "",
    airlines: "",
    flightNumber: "",
    flightClass: "Economy",
    frequentFlyer: "",
    pnr: "",
    ticketNumber: "",
    issueMonth: "",
    IssueDay: "",
    issueYear: "",
    agency: "SkyHigh Agency Ltd.",
    handledBy: "John Doe",
    status: "Confirmed",
    currency: "USD",
    paymentStatus: "Pending",
    paymentMethod: "",
    transactionId: "",
    paymentDate: "",
    buyingPrice: "0.00",
    costPrice: "0.00",
    sellingPrice: "0.00",
    payment: "Pending", // For backward compatibility
    addons: {
      meals: false,
      wheelchair: false,
      pickup: false,
      dropoff: false,
      luggage: false,
    },
    prices: {
      meals: "0.00",
      wheelchair: "0.00",
      pickup: "0.00",
      dropoff: "0.00",
      luggage: "0.00",
    },
    customerType: "existing",
    contactType: "existing",
    itineraries: [
      {
        segments: [],
      },
    ],
  });

  useEffect(() => {
    const loadAgencies = async () => {
      setAgenciesLoading(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "100",
          q: "",
          status: "active",
          sortKey: "agency_name",
          sortDir: "asc",
        });
        const res = await fetch(`/api/agencies?${params.toString()}`);
        const j = await res.json();
        if (!res.ok) {
          console.error("Failed to load agencies", j.error);
          return;
        }
        setAgencies(j.data || []);
      } catch (e) {
        console.error("Failed to load agencies", e);
      } finally {
        setAgenciesLoading(false);
      }
    };

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(rows || []);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setUsersLoading(false);
      }
    };

    loadAgencies();
    loadUsers();
  }, []);

  const [travellerType, setTravellerType] = useState<"existing" | "new">("new");

  useEffect(() => {
    if (booking) {
      let loadedTravellers: Traveller[] = [];
      if (
        booking.travellers &&
        Array.isArray(booking.travellers) &&
        booking.travellers.length > 0
      ) {
        loadedTravellers = booking.travellers.map((t) => ({
          id: t.id || Date.now().toString() + Math.random().toString(),
          firstName: t.firstName || "",
          lastName: t.lastName || "",
          passportNumber: t.passportNumber || "",
          passportExpiry: t.passportExpiry || "",
          dob: t.dob || "",
          nationality: t.nationality || "Nepalese",
          customerId: t.customerId,
          saveToDatabase: t.saveToDatabase || false,
          eticketNumber: t.eticketNumber || "",
        }));
      }

      setFormData((prev) => ({
        ...prev,
        ...booking,
        travellers: loadedTravellers,
        pnr: booking.PNR || prev.pnr,
        // Ensure all fields are mapped
        issueMonth: booking.issueMonth || "",
        IssueDay: booking.IssueDay || "",
        issueYear: booking.issueYear || "",
        buyingPrice: booking.buyingPrice || "0.00",
        payment: booking.payment || "Pending",
        paymentDate: booking.dateofpayment || "",
        customerType: booking.customerType || "existing",
        contactType: booking.contactType || "existing",
        addons: booking.addons || prev.addons,
        prices: (booking.prices as unknown as Prices) || prev.prices,
        stopoverLocation: booking.stopoverLocation || "",
        agency: booking.issuedthroughagency || booking.agency || "N/A",
        customerid:
          booking.customerid ||
          booking.customerId ||
          undefined,
        returnDate: booking.returnDate || "",
        itineraries: booking.itineraries || [{ segments: [] }],
      }));
      if (booking.customer) {
        setSelectedCustomer(booking.customer as unknown as Customer);
      }
      if (booking.stopoverLocation) {
        setShowStopover(true);
      }
    } else {
      // Reset for new booking
      setFormData({
        email: "",
        phone: "",
        travellers: [
          {
            id: Date.now().toString(),
            firstName: "",
            lastName: "",
            passportNumber: "",
            passportExpiry: "",
            nationality: "Australian",
            dob: "",
            eticketNumber: "",
          },
        ],
        travellerFirstName: "",
        travellerLastName: "",
        customerFirstName: "",
        customerLastName: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "Australian",
        dob: "",
        tripType: "One Way",
        travelDate: "",
        returnDate: "",
        origin: "",
        destination: "",
        transit: "",
        airlines: "",
        flightNumber: "",
        flightClass: "Economy",
        frequentFlyer: "",
        pnr: "",
        ticketNumber: "",
        issueMonth: "",
        IssueDay: "",
        issueYear: "",
        agency: "SkyHigh Agency Ltd.",
        handledBy: "",
        status: "Confirmed",
        currency: "USD",
        paymentStatus: "Pending",
        paymentMethod: "",
        transactionId: "",
        paymentDate: "",
        buyingPrice: "0.00",
        costPrice: "0.00",
        sellingPrice: "0.00",
        payment: "Pending",
        addons: {
          meals: false,
          wheelchair: false,
          pickup: false,
          dropoff: false,
          luggage: false,
        },
        prices: {
          meals: "0.00",
          wheelchair: "0.00",
          pickup: "0.00",
          dropoff: "0.00",
          luggage: "0.00",
        },
        customerType: "existing",
        contactType: "existing",
        itineraries: [{ segments: [] }],
      });
      setShowStopover(false);
    }
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "tripType") {
      let newItineraries = [...formData.itineraries];
      if (value === "Round Trip" && newItineraries.length < 2) {
        newItineraries.push({ segments: [] });
      } else if (value === "One Way" && newItineraries.length > 1) {
        newItineraries = [newItineraries[0]];
      }
      setFormData((prev) => ({
        ...prev,
        tripType: value,
        itineraries: newItineraries,
      }));
      return;
    }

    if (type === "checkbox" && name.startsWith("addon-")) {
      const addonName = name.replace("addon-", "") as keyof Addons;
      setFormData((prev) => ({
        ...prev,
        addons: { ...prev.addons, [addonName]: checked },
      }));
    } else if (name.startsWith("price-")) {
      const priceName = name.replace("price-", "");
      setFormData((prev) => ({
        ...prev,
        prices: { ...prev.prices, [priceName]: value },
      }));
    } else if (
      [
        "travellerFirstName",
        "travellerLastName",
        "passportNumber",
        "passportExpiry",
        "nationality",
        "dob",
      ].includes(name)
    ) {
      setFormData((prev) => {
        const newTravellers = [...prev.travellers];
        if (newTravellers.length > 0) {
          const mapping: Record<string, string> = {
            travellerFirstName: "firstName",
            travellerLastName: "lastName",
            passportNumber: "passportNumber",
            passportExpiry: "passportExpiry",
            nationality: "nationality",
            dob: "dob",
          };
          const travellerField = mapping[name];
          newTravellers[0] = {
            ...newTravellers[0],
            [travellerField]: value,
          };
        }
        return { ...prev, [name]: value, travellers: newTravellers };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const calculateAddonsTotal = () => {
    return Object.values(formData.prices || {})
      .reduce((acc, price) => acc + (parseFloat(price) || 0), 0)
      .toFixed(2);
  };

  const calculateGrandTotal = () => {
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const addonsTotal = parseFloat(calculateAddonsTotal()) || 0;
    return (sellingPrice + addonsTotal).toFixed(2);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    if (searchingTravellerIndex !== null) {
      // Update specific traveller
      setFormData((prev) => {
        const newTravellers = [...prev.travellers];
        if (!newTravellers[searchingTravellerIndex]) {
          newTravellers[searchingTravellerIndex] = {
            id: Date.now().toString(),
            firstName: "",
            lastName: "",
          };
        }
        newTravellers[searchingTravellerIndex] = {
          ...newTravellers[searchingTravellerIndex],
          firstName: customer.firstName,
          lastName: customer.lastName,
          passportNumber: customer.passport?.number || "",
          passportExpiry: customer.passport?.expiryDate || "",
          dob: customer.dateOfBirth || "",
          nationality: customer.country || "Nepalese",
          customerId: customer.id,
        };

        const updates: Partial<FormData> = { travellers: newTravellers };

        // Sync primary if index 0
        if (searchingTravellerIndex === 0) {
          updates.travellerFirstName = customer.firstName;
          updates.travellerLastName = customer.lastName;
          updates.passportNumber = customer.passport?.number || "";
          updates.passportExpiry = customer.passport?.expiryDate || "";
          updates.dob = customer.dateOfBirth || "";
          updates.nationality = customer.country || "Nepalese";

          // Also sync contact info if needed
          updates.email = prev.email || customer.email;
          updates.phone = prev.phone || customer.phone;
          updates.customerType = "existing";
        }

        return { ...prev, ...updates };
      });
      setSearchingTravellerIndex(null);
      return;
    }

    // Fallback for "Existing Customer" contact search (not traveller search)
    setFormData((prev) => ({
      ...prev,
      // Common fields
      email: customer.email || prev.email,
      phone: customer.phone || prev.phone,
      nationality: customer.country || prev.nationality,

      // Update Customer Contact fields only
      customerFirstName: customer.firstName || prev.customerFirstName,
      customerLastName: customer.lastName || prev.customerLastName,
    }));
  };

  const handleTravellerSelect = (traveller: DBTraveller) => {
    if (searchingTravellerIndex === null) return;

    setFormData((prev) => {
      const newTravellers = [...prev.travellers];
      newTravellers[searchingTravellerIndex] = {
        ...newTravellers[searchingTravellerIndex],
        firstName: traveller.first_name,
        lastName: traveller.last_name,
        passportNumber: traveller.passport_number || "",
        passportExpiry: traveller.passport_expiry || "",
        dob: traveller.dob || "",
        nationality: traveller.nationality || "Nepalese",
        eticketNumber: "",
      };

      // Sync primary if index 0
      const updates: Partial<FormData> = { travellers: newTravellers };
      if (searchingTravellerIndex === 0) {
        updates.travellerFirstName = traveller.first_name;
        updates.travellerLastName = traveller.last_name;
        updates.passportNumber = traveller.passport_number || "";
        updates.passportExpiry = traveller.passport_expiry || "";
        updates.dob = traveller.dob || "";
        updates.nationality = traveller.nationality || "Nepalese";
      }

      return { ...prev, ...updates };
    });
    setSearchingTravellerIndex(null);
  };

  const handleTravellerChange = (
    index: number,
    field: keyof Traveller,
    value: string | boolean | number | undefined,
  ) => {
    setFormData((prev) => {
      const newTravellers = [...prev.travellers];
      newTravellers[index] = { ...newTravellers[index], [field]: value };

      // Sync primary traveller (index 0) with flat fields
      if (index === 0) {
        const mapping: Record<string, keyof FormData> = {
          firstName: "travellerFirstName",
          lastName: "travellerLastName",
          passportNumber: "passportNumber",
          passportExpiry: "passportExpiry",
          dob: "dob",
          nationality: "nationality",
        };
        if (mapping[field as string]) {
          const formDataField = mapping[field as string];
          // Use type assertion safely for dynamic key access
          (prev as unknown as Record<string, unknown>)[formDataField] = value;
        }
      }
      return { ...prev, travellers: newTravellers };
    });
  };

  const addTraveller = () => {
    setFormData((prev) => ({
      ...prev,
      travellers: [
        ...prev.travellers,
        {
          id: Date.now().toString(),
          firstName: "",
          lastName: "",
          passportNumber: "",
          passportExpiry: "",
          dob: "",
          nationality: "Nepalese",
          eticketNumber: "",
        },
      ],
    }));
  };

  const removeTraveller = (index: number) => {
    setFormData((prev) => {
      if (prev.travellers.length <= 1) return prev;
      const newTravellers = [...prev.travellers];
      newTravellers.splice(index, 1);
      return { ...prev, travellers: newTravellers };
    });
  };

  const addSegment = (itineraryIndex: number) => {
    setFormData((prev) => {
      const newItineraries = [...prev.itineraries];
      newItineraries[itineraryIndex].segments.push({
        departure: { iataCode: "", at: "" },
        arrival: { iataCode: "", at: "" },
        carrierCode: "",
        number: "",
        duration: "",
      });
      return { ...prev, itineraries: newItineraries };
    });
  };

  const removeSegment = (itineraryIndex: number, segmentIndex: number) => {
    setFormData((prev) => {
      const newItineraries = [...prev.itineraries];
      newItineraries[itineraryIndex].segments.splice(segmentIndex, 1);
      return { ...prev, itineraries: newItineraries };
    });
  };

  const handleSegmentChange = (
    itineraryIndex: number,
    segmentIndex: number,
    field: keyof FlightSegment | "departure" | "arrival",
    value: string | number | { code: string } | undefined,
    nestedField?: "iataCode" | "terminal" | "at" | "code",
  ) => {
    setFormData((prev) => {
      const newItineraries = [...prev.itineraries];
      const segment = newItineraries[itineraryIndex].segments[segmentIndex];

      if (nestedField) {
        // Handle nested fields like departure.iataCode
        const target = (segment as unknown as Record<string, Record<string, unknown>>)[field];
        (segment as unknown as Record<string, Record<string, unknown>>)[field] = {
          ...target,
          [nestedField]: value,
        };
      } else {
        (segment as unknown as Record<string, unknown>)[field] = value;
      }

      return { ...prev, itineraries: newItineraries };
    });
  };

  const handleConfirmIssue = async () => {
    if (!booking?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "Issued",
          bookingstatus: "Issued",
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Update local state
      setFormData((prev) => ({ ...prev, status: "Issued" }));
    } catch (err) {
      console.error("Error issuing booking:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    // Process new travellers to save to DB
    for (const t of formData.travellers) {
      if (t.saveToDatabase && t.firstName && t.lastName) {
        try {
          const { error } = await supabase.from("travellers").insert({
            first_name: t.firstName,
            last_name: t.lastName,
            passport_number: t.passportNumber,
            passport_expiry: t.passportExpiry || null,
            dob: t.dob || null,
            nationality: t.nationality,
          });
          if (error) console.error("Error saving traveller:", error);
        } catch (err) {
          console.error("Error processing traveller save:", err);
        }
      }
    }

    // Validation: Ensure customer is selected if "Existing" is chosen
    // if (formData.contactType === "existing" && !formData.customerid) {
    //   alert("Please select an existing customer from the search results.");
    //   return;
    // }

    // Helper to convert empty strings to null for date fields
    const toDateOrNull = (dateStr: string | undefined) => {
      if (!dateStr || dateStr.trim() === "") return null;
      return dateStr;
    };

    // Auto-detect Draft status if details are missing
    const requiredFields = [
      "pnr",
      "airlines",
      "origin",
      "destination",
      "travelDate",
      "tripType",
      "flightClass",
      "flightNumber",
    ];

    let hasMissingFields = requiredFields.some((field) => {
      const val = formData[field as keyof FormData];
      return !val || (typeof val === "string" && val.trim() === "");
    });

    // Conditional check for Round Trip
    if (formData.tripType === "Round Trip") {
      if (!formData.returnDate || formData.returnDate.trim() === "") {
        hasMissingFields = true;
      }
    }

    const hasValidTraveller =
      formData.travellers.length > 0 &&
      formData.travellers.every(
        (t) => t.firstName && t.firstName.trim() !== "" && t.lastName && t.lastName.trim() !== ""
      );

    let finalStatus = formData.status;

    // If user explicitly selected Cancelled or Refunded (if available), respect it?
    // But if they try to save as Confirmed/Pending with missing details, force Draft.
    // ADDED: Respect "Issued" if manually selected
    if (
      (hasMissingFields || !hasValidTraveller) &&
      !["Cancelled", "Issued"].includes(finalStatus)
    ) {
      finalStatus = "Draft";
    }

    // Map back to the Booking interface structure before saving
    const bookingToSave: Partial<Booking> = {
      // Legacy flat fields removed to prevent usage
      // travellerFirstName: ... // REMOVED
      // travellerLastName: ...  // REMOVED

      // Core booking fields
      PNR: formData.pnr,
      // ticketNumber: ... // REMOVED
      airlines: formData.airlines,
      travelDate: toDateOrNull(formData.travelDate),
      departureDate: toDateOrNull(formData.travelDate),
      returnDate: toDateOrNull(formData.returnDate),
      itineraries: formData.itineraries,
      origin: formData.origin,
      transit: formData.transit,
      destination: formData.destination,
      tripType: formData.tripType,
      issueMonth: formData.issueMonth || new Date().getMonth() + 1 + "",
      IssueDay: formData.IssueDay || new Date().getDate() + "",
      issueYear: formData.issueYear || new Date().getFullYear() + "",
      buyingPrice: formData.costPrice,
      costprice: formData.costPrice,
      sellingPrice: formData.sellingPrice,
      payment: formData.paymentStatus,
      status: finalStatus,

      // Re-enabled fields as columns are added to DB
      email: formData.email,
      phone: formData.phone,

      // Passport info - prefer travellers array but keep flat if needed for some legacy view
      passportNumber:
        formData.travellers[0]?.passportNumber || formData.passportNumber,
      passportExpiry: toDateOrNull(
        formData.travellers[0]?.passportExpiry || formData.passportExpiry,
      ),
      nationality: formData.travellers[0]?.nationality || formData.nationality,
      dob: toDateOrNull(formData.dob),

      flightNumber: formData.flightNumber,
      flightClass: formData.flightClass,
      frequentFlyer: formData.frequentFlyer,
      issuedthroughagency: formData.agency,
      handledBy: formData.handledBy,
      paymentStatus: formData.paymentStatus,
      paymentmethod: formData.paymentMethod,
      // transactionId: formData.transactionId,
      dateofpayment: toDateOrNull(formData.paymentDate), // Mapped to correct DB column
      // stopoverLocation: formData.stopoverLocation,
      travellers: formData.travellers, // The Source of Truth
      customer:
        formData.contactType === "existing" && selectedCustomer
          ? selectedCustomer
          : ({
              firstName: formData.customerFirstName,
              lastName: formData.customerLastName,
              email: formData.email,
              phone: formData.phone,
              country: formData.nationality,
            } as unknown as Customer),

      // Custom fields
      customerType: formData.customerType,
      contactType: formData.contactType,
      addons: formData.addons,
      prices: formData.prices,
      // customerFirstName: formData.customerFirstName,
      // customerLastName: formData.customerLastName,
    };
    onSave(bookingToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[95vw] h-[95vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border border-gray-200 mx-4">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {booking ? "Edit Booking" : "New Booking"}
            </h1>
            <p className="text-xs text-gray-500">
              {booking
                ? `Manage details for Booking #${booking.id}`
                : "Enter new booking details"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </header>

        {/* Main Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <main className="p-6 lg:p-8">
            <div className="mb-8">
              <MultiStepProgress
                steps={steps}
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Main Content Area */}
                <div className="space-y-6">
                  {currentStep === 0 && (
                    <>
                      {/* Customer Contact Details */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                            <span className="material-symbols-outlined text-primary mr-3">
                              contact_mail
                            </span>
                            Customer Contact Details
                          </h3>
                        </div>
                        <div className="p-8">
                          <div className="mb-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center h-6">
                                  <input
                                    checked={formData.contactType === "existing"}
                                    onChange={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        contactType: "existing",
                                      }))
                                    }
                                    className="focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer"
                                    id="existing-contact"
                                    name="contact-type"
                                    type="radio"
                                    value="existing"
                                  />
                                </div>
                                <label
                                  className="font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900"
                                  htmlFor="existing-contact"
                                >
                                  Existing Customer
                                </label>
                              </div>
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="flex items-center h-6">
                                  <input
                                    checked={formData.contactType === "new"}
                                    onChange={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        contactType: "new",
                                      }))
                                    }
                                    className="focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer"
                                    id="new-contact"
                                    name="contact-type"
                                    type="radio"
                                    value="new"
                                  />
                                </div>
                                <label
                                  className="font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900"
                                  htmlFor="new-contact"
                                >
                                  New Customer
                                </label>
                              </div>
                            </div>

                            {formData.contactType === "existing" && (
                              <div className="w-full mt-6 relative">
                                <CustomerSearch
                                  onSelect={handleCustomerSelect}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </div>

                          {formData.contactType === "new" && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <label
                                    className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                    htmlFor="customerFirstName"
                                  >
                                    First Name
                                  </label>
                                  <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                      <span
                                        className="material-symbols-outlined text-slate-400"
                                        style={{ fontSize: "20px" }}
                                      >
                                        person
                                      </span>
                                    </div>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase"
                                      id="customerFirstName"
                                      name="customerFirstName"
                                      type="text"
                                      value={formData.customerFirstName}
                                      onChange={handleChange}
                                      placeholder="Given Name"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label
                                    className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                    htmlFor="customerLastName"
                                  >
                                    Last Name
                                  </label>
                                  <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                      <span
                                        className="material-symbols-outlined text-slate-400"
                                        style={{ fontSize: "20px" }}
                                      >
                                        person
                                      </span>
                                    </div>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase"
                                      id="customerLastName"
                                      name="customerLastName"
                                      type="text"
                                      value={formData.customerLastName}
                                      onChange={handleChange}
                                      placeholder="Surname"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <label
                                    className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                    htmlFor="email"
                                  >
                                    Email Address
                                  </label>
                                  <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                      <span
                                        className="material-symbols-outlined text-slate-400"
                                        style={{ fontSize: "20px" }}
                                      >
                                        email
                                      </span>
                                    </div>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                                      id="email"
                                      name="email"
                                      type="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      placeholder="customer@email.com"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label
                                    className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                    htmlFor="phone"
                                  >
                                    Phone Number
                                  </label>
                                  <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                      <span
                                        className="material-symbols-outlined text-slate-400"
                                        style={{ fontSize: "20px" }}
                                      >
                                        phone
                                      </span>
                                    </div>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                                      id="phone"
                                      name="phone"
                                      type="tel"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      placeholder="+61 XXX XXX XXX"
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      {/* Traveller Information */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                            <span className="material-symbols-outlined text-primary mr-3">
                              person
                            </span>
                            Traveller Information
                          </h3>
                        </div>
                        <div className="p-8">
                          {formData.travellers.map((traveller, index) => (
                            <div
                              key={traveller.id || index}
                              className="mb-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100 relative group"
                            >
                              <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">
                                    {index + 1}
                                  </span>
                                  Traveller Details
                                </h4>
                                <div className="flex gap-2">
                                  {formData.travellers.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeTraveller(index)}
                                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">
                                        delete
                                      </span>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center h-6">
                                      <input
                                        checked={travellerType === "existing"}
                                        onChange={() => {
                                          setTravellerType("existing");
                                          setSearchingTravellerIndex(index);
                                        }}
                                        className="focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer"
                                        id={`existing-traveller-${index}`}
                                        name={`traveller-type-${index}`}
                                        type="radio"
                                        value="existing"
                                      />
                                    </div>
                                    <label
                                      className="font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900"
                                      htmlFor={`existing-traveller-${index}`}
                                    >
                                      Existing Traveller
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="flex items-center h-6">
                                      <input
                                        checked={travellerType === "new"}
                                        onChange={() => {
                                          setTravellerType("new");
                                          setSearchingTravellerIndex(null);
                                        }}
                                        className="focus:ring-primary h-5 w-5 text-primary border-slate-300 cursor-pointer"
                                        id={`new-traveller-${index}`}
                                        name={`traveller-type-${index}`}
                                        type="radio"
                                        value="new"
                                      />
                                    </div>
                                    <label
                                      className="font-bold text-slate-700 text-sm whitespace-nowrap cursor-pointer hover:text-slate-900"
                                      htmlFor={`new-traveller-${index}`}
                                    >
                                      New Traveller
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {travellerType === "existing" && (
                                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                                    Search Existing Traveller
                                  </label>
                                  <TravellerSearch
                                    onSelect={(t) => {
                                      handleTravellerSelect(t);
                                    }}
                                  />
                                  <p className="text-xs text-slate-500 mt-2">
                                    Select a traveller to auto-fill their details.
                                  </p>
                                </div>
                              )}

                              {(travellerType === "new" ||
                                (travellerType === "existing" &&
                                  traveller.firstName)) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                      First Name
                                    </label>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium pl-4 uppercase"
                                      value={traveller.firstName}
                                      onChange={(e) =>
                                        handleTravellerChange(
                                          index,
                                          "firstName",
                                          e.target.value,
                                        )
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Given Name"
                                    />
                                  </div>
                                  <div className="col-span-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                      Last Name
                                    </label>
                                    <input
                                      className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium pl-4 uppercase"
                                      value={traveller.lastName}
                                      onChange={(e) =>
                                        handleTravellerChange(
                                          index,
                                          "lastName",
                                          e.target.value,
                                        )
                                      }
                                      disabled={isReadOnly}
                                      placeholder="Surname"
                                    />
                                  </div>
                                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                        Passport Number
                                      </label>
                                      <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                          <span
                                            className="material-symbols-outlined text-slate-400"
                                            style={{ fontSize: "20px" }}
                                          >
                                            badge
                                          </span>
                                        </div>
                                        <input
                                          className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium uppercase"
                                          value={traveller.passportNumber || ""}
                                          onChange={(e) =>
                                            handleTravellerChange(
                                              index,
                                              "passportNumber",
                                              e.target.value,
                                            )
                                          }
                                          disabled={isReadOnly}
                                          placeholder="e.g. A1234567X"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                        Passport Expiry Date
                                      </label>
                                      <input
                                        className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4"
                                        type="date"
                                        value={traveller.passportExpiry || ""}
                                        onChange={(e) =>
                                          handleTravellerChange(
                                            index,
                                            "passportExpiry",
                                            e.target.value,
                                          )
                                        }
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                        Nationality
                                      </label>
                                      <select
                                        className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4"
                                        value={traveller.nationality || "Nepalese"}
                                        onChange={(e) =>
                                          handleTravellerChange(
                                            index,
                                            "nationality",
                                            e.target.value,
                                          )
                                        }
                                        disabled={isReadOnly}
                                      >
                                        {countryData.countries.map((c) => (
                                          <option key={c.value} value={c.label}>
                                            {c.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                        Date of Birth
                                      </label>
                                      <input
                                        className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4"
                                        type="date"
                                        value={traveller.dob || ""}
                                        onChange={(e) =>
                                          handleTravellerChange(
                                            index,
                                            "dob",
                                            e.target.value,
                                          )
                                        }
                                        disabled={isReadOnly}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                                        E-Ticket Number
                                      </label>
                                      <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                          <span
                                            className="material-symbols-outlined text-slate-400"
                                            style={{ fontSize: "20px" }}
                                          >
                                            confirmation_number
                                          </span>
                                        </div>
                                        <input
                                          className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                                          value={traveller.eticketNumber || ""}
                                          onChange={(e) =>
                                            handleTravellerChange(
                                              index,
                                              "eticketNumber",
                                              e.target.value,
                                            )
                                          }
                                          disabled={isReadOnly}
                                          placeholder="E-Ticket No."
                                        />
                                      </div>
                                    </div>
                                    <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                      <div className="flex items-center h-5 mt-0.5">
                                        <input
                                          type="checkbox"
                                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary cursor-pointer"
                                          checked={
                                            traveller.saveToDatabase || false
                                          }
                                          onChange={(e) =>
                                            handleTravellerChange(
                                              index,
                                              "saveToDatabase",
                                              e.target.checked,
                                            )
                                          }
                                          disabled={isReadOnly}
                                        />
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                                          Save to Travellers Database
                                        </span>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          Add this person to your saved travellers
                                          list for future bookings.
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={addTraveller}
                            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined">
                              person_add
                            </span>
                            Add Another Traveller
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      {/* Route & Trip Details */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                            <span className="material-symbols-outlined text-primary mr-3">
                              flight_takeoff
                            </span>
                            Route & Trip Details
                          </h3>
                        </div>
                        <div className="p-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">
                                Trip Type
                              </label>
                              <select
                                className="block w-full h-10 rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-3"
                                name="tripType"
                                value={formData.tripType}
                                onChange={handleChange}
                                disabled={isReadOnly}
                              >
                                <option>One Way</option>
                                <option>Round Trip</option>
                                <option>Multi City</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">
                                  Departure Date
                                </label>
                                <input
                                  className="block w-full h-10 rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-3"
                                  name="travelDate"
                                  type="date"
                                  value={formData.travelDate}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                />
                              </div>
                              {formData.tripType === "Round Trip" && (
                                <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">
                                    Return Date
                                  </label>
                                  <input
                                    className="block w-full h-10 rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-3"
                                    name="returnDate"
                                    type="date"
                                    value={formData.returnDate}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <AirportAutocomplete
                                label="Origin (From)"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                icon="flight_takeoff"
                                className="block w-full h-10 pl-12 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                              />
                            </div>
                            <div>
                              <AirportAutocomplete
                                label="Destination (To)"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                icon="flight_land"
                                className="block w-full h-10 pl-12 pr-10 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                              />
                            </div>
                          </div>

                          {/* Detailed Itinerary Segments */}
                          <div className="space-y-4">
                            {formData.itineraries?.map((itinerary, itinIndex) => (
                              <div
                                key={itinIndex}
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                                    {itinIndex === 0
                                      ? "Outbound Flight Segments"
                                      : "Return Flight Segments"}
                                  </h4>
                                </div>

                                <div className="space-y-3">
                                  {itinerary.segments.map((segment, segIndex) => (
                                    <div
                                      key={segIndex}
                                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeSegment(itinIndex, segIndex)
                                        }
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                                      >
                                        <span className="material-symbols-outlined text-lg">
                                          delete
                                        </span>
                                      </button>

                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                        {/* Departure */}
                                        <div className="col-span-1 md:col-span-2">
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Departure
                                          </label>
                                          <div className="grid grid-cols-3 gap-2 mt-1">
                                            <input
                                              placeholder="IATA"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.departure?.iataCode}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "departure",
                                                  e.target.value,
                                                  "iataCode",
                                                )
                                              }
                                            />
                                            <input
                                              placeholder="Terminal"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.departure?.terminal}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "departure",
                                                  e.target.value,
                                                  "terminal",
                                                )
                                              }
                                            />
                                            <input
                                              type="datetime-local"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.departure?.at}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "departure",
                                                  e.target.value,
                                                  "at",
                                                )
                                              }
                                            />
                                          </div>
                                        </div>

                                        {/* Arrival */}
                                        <div className="col-span-1 md:col-span-2">
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Arrival
                                          </label>
                                          <div className="grid grid-cols-3 gap-2 mt-1">
                                            <input
                                              placeholder="IATA"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.arrival?.iataCode}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "arrival",
                                                  e.target.value,
                                                  "iataCode",
                                                )
                                              }
                                            />
                                            <input
                                              placeholder="Terminal"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.arrival?.terminal}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "arrival",
                                                  e.target.value,
                                                  "terminal",
                                                )
                                              }
                                            />
                                            <input
                                              type="datetime-local"
                                              className="block w-full h-9 rounded-md border-slate-300 text-sm px-2"
                                              value={segment.arrival?.at}
                                              onChange={(e) =>
                                                handleSegmentChange(
                                                  itinIndex,
                                                  segIndex,
                                                  "arrival",
                                                  e.target.value,
                                                  "at",
                                                )
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Carrier
                                          </label>
                                          <input
                                            placeholder="Code (e.g. QF)"
                                            className="block w-full mt-1 h-9 rounded-md border-slate-300 text-sm px-2"
                                            value={segment.carrierCode}
                                            onChange={(e) =>
                                              handleSegmentChange(
                                                itinIndex,
                                                segIndex,
                                                "carrierCode",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Flight No.
                                          </label>
                                          <input
                                            placeholder="Number"
                                            className="block w-full mt-1 h-9 rounded-md border-slate-300 text-sm px-2"
                                            value={segment.number}
                                            onChange={(e) =>
                                              handleSegmentChange(
                                                itinIndex,
                                                segIndex,
                                                "number",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Aircraft
                                          </label>
                                          <input
                                            placeholder="Code"
                                            className="block w-full mt-1 h-9 rounded-md border-slate-300 text-sm px-2"
                                            value={segment.aircraft?.code}
                                            onChange={(e) =>
                                              handleSegmentChange(
                                                itinIndex,
                                                segIndex,
                                                "aircraft",
                                                e.target.value,
                                                "code",
                                              )
                                            }
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-bold text-slate-500 uppercase">
                                            Duration
                                          </label>
                                          <input
                                            placeholder="PTxxHxxM"
                                            className="block w-full mt-1 h-9 rounded-md border-slate-300 text-sm px-2"
                                            value={segment.duration}
                                            onChange={(e) =>
                                              handleSegmentChange(
                                                itinIndex,
                                                segIndex,
                                                "duration",
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => addSegment(itinIndex)}
                                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-primary hover:text-primary hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-sm"
                                  >
                                    <span className="material-symbols-outlined text-lg">
                                      add
                                    </span>
                                    Add Flight Segment
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                Global Flight Details
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="md:col-span-1">
                                <AirlineAutocomplete
                                  label="Primary Airline"
                                  name="airlines"
                                  value={formData.airlines}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                  icon="airlines"
                                  className="block w-full h-10 pl-12 rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                                />
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">
                                  Class
                                </label>
                                <select
                                  className="block w-full h-10 rounded-lg border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4"
                                  name="flightClass"
                                  value={formData.flightClass}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                >
                                  <option>Economy</option>
                                  <option>Premium Economy</option>
                                  <option>Business</option>
                                  <option>First Class</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3">
                              <span className="material-symbols-outlined text-blue-500 mt-0.5">
                                info
                              </span>
                              <div>
                                <p className="text-sm text-blue-800 font-medium">
                                  Itinerary Modification
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                  Changing origin, destination, or dates may affect
                                  pricing. Ensure to re-calculate fares after
                                  modifying the itinerary.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      {/* Add-ons & Services */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                          <h3 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                            <span className="material-symbols-outlined text-primary mr-3">
                              extension
                            </span>
                            Add-ons & Services
                          </h3>
                        </div>
                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                Ancillary Services
                              </h4>
                              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                <div className="flex items-center">
                                  <label className="flex items-center space-x-4 cursor-pointer group">
                                    <input
                                      className="h-5 w-5 text-primary border-slate-300 rounded focus:ring-primary transition-all cursor-pointer"
                                      type="checkbox"
                                      name="addon-meals"
                                      checked={formData.addons.meals}
                                      onChange={handleChange}
                                    />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                                      Meals
                                    </span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setIsMealModalOpen(true)}
                                    className="ml-4 text-xs font-bold text-primary hover:text-blue-700 cursor-pointer flex items-center gap-1.5 transition-colors px-2 py-1 bg-blue-50 rounded-md"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      tune
                                    </span>
                                    Options
                                  </button>
                                </div>
                                <div className="relative w-32">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-400 font-bold sm:text-xs">
                                      $
                                    </span>
                                  </div>
                                  <input
                                    className="block w-full h-10 rounded-lg border-slate-200 pl-7 text-right focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700"
                                    name="price-meals"
                                    value={formData.prices?.meals || ""}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    type="number"
                                  />
                                </div>
                              </div>
                              {/* Simplified remaining addons */}
                              <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                                <label className="flex items-center space-x-4 cursor-pointer group">
                                  <input
                                    className="h-5 w-5 text-primary border-slate-300 rounded focus:ring-primary transition-all cursor-pointer"
                                    type="checkbox"
                                    name="addon-wheelchair"
                                    checked={formData.addons.wheelchair}
                                    onChange={handleChange}
                                  />
                                  <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                                    Wheelchair
                                  </span>
                                </label>
                                <div className="relative w-32">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-400 font-bold sm:text-xs">
                                      $
                                    </span>
                                  </div>
                                  <input
                                    className="block w-full h-10 rounded-lg border-slate-200 pl-7 text-right focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700"
                                    name="price-wheelchair"
                                    value={formData.prices?.wheelchair || ""}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    type="number"
                                  />
                                </div>
                              </div>
                              <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                  Add-ons Subtotal
                                </span>
                                <div className="text-xl font-black text-primary">
                                  ${calculateAddonsTotal()}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-8">
                              <div>
                                <label
                                  className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                  htmlFor="frequent-flyer"
                                >
                                  Frequent Flyer Number
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span
                                      className="material-symbols-outlined text-slate-400"
                                      style={{ fontSize: "20px" }}
                                    >
                                      loyalty
                                    </span>
                                  </div>
                                  <input
                                    className="block w-full h-12 rounded-lg border-slate-200 pl-11 focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
                                    id="frequent-flyer"
                                    name="frequentFlyer"
                                    placeholder="e.g. AA-12345678"
                                    type="text"
                                    value={formData.frequentFlyer}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 tracking-tight">
                                  Seat Selection
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-primary/30 transition-all cursor-pointer group h-28">
                                  <span
                                    className="material-symbols-outlined text-slate-400 group-hover:text-primary mb-2 transition-colors"
                                    style={{ fontSize: "28px" }}
                                  >
                                    event_seat
                                  </span>
                                  <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors tracking-tight">
                                    Select Premium Seat
                                  </span>
                                  <span className="text-xs text-primary mt-1 font-black bg-blue-50 px-2 py-0.5 rounded">
                                    FROM $25.00
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      {/* Financials Summary relocated to Step 4 */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                            <span className="material-symbols-outlined text-primary mr-3">
                              payments
                            </span>
                            Financials Summary
                          </h3>
                        </div>
                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <label
                                className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                htmlFor="payment-status"
                              >
                                Payment Status
                              </label>
                              <select
                                className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700 px-4"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                onChange={handleChange}
                                disabled={isReadOnly}
                              >
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Refunded</option>
                              </select>
                            </div>
                            <div>
                              <label
                                className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                htmlFor="payment-method"
                              >
                                Payment Method
                              </label>
                              <select
                                className="block w-full h-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700 px-4"
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                disabled={isReadOnly}
                              >
                                <option value="">Select Method</option>
                                <option>Cash</option>
                                <option>Bank Transfer</option>
                                <option>Credit Card</option>
                                <option>PayID</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <label
                                className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                htmlFor="cost-price"
                              >
                                Cost Price ($)
                              </label>
                              <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                  <span className="text-slate-400 font-bold">$</span>
                                </div>
                                <input
                                  className="block w-full h-12 rounded-lg border-slate-200 pl-8 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700"
                                  name="costPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.costPrice}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                className="block text-sm font-bold text-slate-700 mb-2 tracking-tight"
                                htmlFor="selling-price"
                              >
                                Selling Price ($)
                              </label>
                              <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                  <span className="text-slate-400 font-bold">$</span>
                                </div>
                                <input
                                  className="block w-full h-12 rounded-lg border-slate-200 pl-8 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-black text-primary"
                                  name="sellingPrice"
                                  type="number"
                                  step="0.01"
                                  value={formData.sellingPrice}
                                  onChange={handleChange}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-base font-bold text-slate-500">
                                Fare Amount
                              </span>
                              <span className="text-base font-black text-slate-900">
                                ${formData.sellingPrice}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-base font-bold text-slate-500">
                                Add-ons Total
                              </span>
                              <span className="text-base font-black text-slate-900">
                                + ${calculateAddonsTotal()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t-2 border-slate-200">
                              <div>
                                <span className="text-lg font-black text-slate-900 block">
                                  Grand Total
                                </span>
                                <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                                  Inclusive of all taxes & fees
                                </span>
                              </div>
                              <span className="text-3xl font-black text-primary tracking-tight">
                            ${calculateGrandTotal()}
                          </span>
                        </div>
                      </div>

                      {/* MARK AS ISSUED button moved to Step 4 */}
                      {!isReadOnly && formData.status !== "Issued" && (
                        <div className="flex justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (!booking?.id) {
                                alert("Please save the booking first before marking it as Issued to send notifications.");
                                return;
                              }
                              setShowNotificationModal(true);
                            }}
                            className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center gap-3 active:scale-95"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                            MARK AS ISSUED
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                      {/* Review Section */}
                      <div className="bg-blue-50 rounded-xl border border-blue-100 p-8 flex items-start gap-6">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-blue-600">
                            verified
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-900">Ready to Save</h3>
                          <p className="text-blue-700/80 mt-1 leading-relaxed">
                            Please verify all passenger details, itinerary segments, and financials before completing the booking. Once saved, you can issue the ticket or send notifications to the customer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Sidebar Sections (Stacked Full Width) */}
                {/* Booking Details */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Booking Details
                      </h3>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                          ID Ref (Read Only)
                        </label>
                        <input
                          className="block w-full h-11 rounded-lg border-slate-100 bg-slate-50 text-slate-400 shadow-none cursor-not-allowed sm:text-sm font-mono"
                          readOnly
                          type="text"
                          value={booking?.id ? `#${booking.id}` : "NEW"}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2"
                          htmlFor="pnr"
                        >
                          PNR Reference
                        </label>
                        <input
                          className="block w-full h-11 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 font-mono uppercase sm:text-sm font-bold text-slate-700 pl-4"
                          name="pnr"
                          type="text"
                          value={formData.pnr}
                          onChange={handleChange}
                          disabled={isReadOnly}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2"
                          htmlFor="agency"
                        >
                          Issued through
                        </label>
                        <select
                          className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                          name="agency"
                          value={formData.agency}
                          onChange={handleChange}
                          disabled={isReadOnly}
                        >
                          <option value="">
                            {agenciesLoading
                              ? "Loading agencies..."
                              : "Select issuing agency"}
                          </option>
                          {agencies.map((agency) => (
                            <option key={agency.uid} value={agency.agency_name}>
                              {agency.agency_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2"
                          htmlFor="handledBy"
                        >
                          Issued By
                        </label>
                        <input
                          type="text"
                          className="block w-full h-10 rounded-lg border-slate-200 px-3 bg-slate-50 text-slate-500 sm:text-sm font-medium cursor-not-allowed"
                          name="handledBy"
                          value={formData.handledBy}
                          placeholder="System User"
                          readOnly
                          disabled
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2"
                          htmlFor="status"
                        >
                          Booking Status
                        </label>
                        <select
                          className="block w-full h-11 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-slate-700 px-4"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          disabled={isReadOnly}
                        >
                          <option value="Confirmed">Hold (Confirmed)</option>
                          <option value="ON_HOLD">On Hold</option>
                          <option value="Issued">Issued</option>
                          <option value="Pending">Pending</option>
                          <option value="Draft">Draft</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                  </div>
                </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-col gap-3 sticky bottom-0 bg-gray-50 p-2 -mx-2">
                    <button
                      className="w-full flex justify-center items-center h-14 border border-transparent shadow-lg text-base font-black rounded-xl text-white bg-primary hover:bg-blue-600 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-blue-500/20 disabled:opacity-50"
                      type="submit"
                      disabled={isLoading}
                    >
                      <span className="material-symbols-outlined text-2xl mr-3">
                        save
                      </span>
                      {isLoading ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                    <button
                      className="w-full flex justify-center items-center h-14 border-2 border-slate-100 shadow-sm text-base font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all"
                      type="button"
                      onClick={onClose}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>

      {/* Meal Modal */}
      {isMealModalOpen && (
        <div className="fixed inset-0 z-[60] flex justify-center items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => setIsMealModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden ring-1 ring-slate-200 flex flex-col max-h-[90vh] transition-all transform scale-100">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Select Meal Options
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">
                  Premium Flight Services
                </p>
              </div>
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-all cursor-pointer p-2 rounded-xl hover:bg-slate-100"
              >
                <span className="material-symbols-outlined font-bold">
                  close
                </span>
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              {[
                {
                  id: "vml",
                  name: "Vegetarian Hindu Meal",
                  desc: "No beef, no pork, prepared with dairy.",
                },
                {
                  id: "moors",
                  name: "Muslim Meal",
                  desc: "No pork, no alcohol, Halal certified.",
                },
                {
                  id: "ksml",
                  name: "Kosher Meal",
                  desc: "Prepared under rabbinic supervision.",
                },
                {
                  id: "vgml",
                  name: "Vegan Meal",
                  desc: "No animal products, no honey or eggs.",
                },
                {
                  id: "gfml",
                  name: "Gluten Free Meal",
                  desc: "Prepared without wheat, barley or rye.",
                },
              ].map((meal) => (
                <label
                  key={meal.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center h-6 mt-1">
                    <input
                      name="meal-selection"
                      type="radio"
                      className="w-5 h-5 text-primary border-slate-300 focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">
                      {meal.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {meal.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                CLOSE
              </button>
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="px-8 py-2.5 text-sm font-black text-white bg-primary rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all"
              >
                CONFIRM SELECTION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Icons Link Removed */}
      {showNotificationModal && booking && (
        <NotificationConfirmModal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          onConfirm={handleConfirmIssue}
          booking={booking}
        />
      )}
    </div>
  );
}
