"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import AirlineAutocomplete from "@/components/AirlineAutocomplete";
import CustomerSearch from "@/components/CustomerSearch";
import TravellerSearch from "@/components/TravellerSearch";
import Link from "next/link";
import { Customer, Traveller, FlightItinerary, Service } from "@/types";
import countryData from "../../../../../../libs/shared-utils/constants/country.json";

type Agency = {
  uid: string;
  agency_name: string;
  status: string;
};

type TravellerRow = {
  first_name?: string | null;
  last_name?: string | null;
  passport_number?: string | null;
  passport_expiry?: string | null;
  dob?: string | null;
  nationality?: string | null;
};

const toAddressString = (addr: unknown): string => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr !== "object") return "";
  const a = addr as Record<string, unknown>;
  const parts = [a.street, a.city, a.state, a.postalCode, a.country].filter(
    (v) => typeof v === "string" && v.trim().length > 0,
  ) as string[];
  return parts.join(", ");
};

// Define interface for form data to ensure type safety
interface FormData {
  email: string;
  phone: string;
  address: string;
  travellers: Traveller[]; // Array of travellers
  // travellerFirstName: string; // REMOVED
  // travellerLastName: string; // REMOVED
  passportNumber: string; // Deprecated
  passportExpiry: string; // Deprecated
  nationality: string; // Deprecated
  dob: string; // Deprecated
  tripType: string;
  travelDate: string;
  returnDate: string;
  origin: string;
  destination: string;
  transit: string;
  stopoverLocation: string;
  stopoverArrival: string;
  stopoverDeparture: string;
  airlines: string;
  flightNumber: string;
  flightClass: string;
  itineraries: FlightItinerary[];
  addons: Record<string, boolean>;
  prices: Record<string, string>;
  frequentFlyer: string;
  pnr: string;
  agency: string;
  handledBy: string; // New field
  status: string;
  paymentStatus: string;
  paymentMethod: string; // New field
  transactionId: string; // New field
  dateofpayment: string; // New field
  costPrice: number | string;
  sellingPrice: number | string;
  customerType: string;
  contactType: string;
  notes: string; // New field
}

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [showStopover, setShowStopover] = useState(false);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [existingContactSelected, setExistingContactSelected] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | number | undefined
  >(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedTraveler, setSelectedTraveler] = useState<Customer | null>(
    null,
  );
  const [searchingTravellerIndex, setSearchingTravellerIndex] = useState<
    number | null
  >(null);
  const [travellerType, setTravellerType] = useState<"existing" | "new">("new");

  const logAssignmentChange = (
    oldId: string | number | undefined,
    newId: string | number | undefined,
    context: string,
  ) => {
    if (!oldId && !newId) return;
    if (oldId === newId) return;
    const timestamp = new Date().toISOString();
    console.log(
      `[AUDIT] ${timestamp} - Customer Association Changed (${context}): ${
        oldId || "None"
      } -> ${newId}`,
    );
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

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
    loadAgencies();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("status", true)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Failed to load services", error);
          return;
        }
        setServices((data || []) as Service[]);
      } catch (e) {
        console.error("Failed to load services", e);
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Contact Validation
    if (formData.contactType === "new") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      if (!formData.phone || !phoneRegex.test(formData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }

      if (!formData.address || formData.address.length < 5) {
        errors.address = "Address must be at least 5 characters long";
      }
    }

    // Traveller Validation
    formData.travellers.forEach((traveller, index) => {
      if (!traveller.firstName || traveller.firstName.trim().length < 2) {
        errors[`traveller_${index}_firstName`] = "First name is required";
      }
      if (!traveller.lastName || traveller.lastName.trim().length < 2) {
        errors[`traveller_${index}_lastName`] = "Last name is required";
      }
      // Basic validation for other fields if they are meant to be mandatory
      // For now, enforcing names as critical.
    });

    if (formData.customerType === "new") {
      if (
        !formData.passportNumber ||
        formData.passportNumber.trim().length < 5
      ) {
        errors.passportNumber = "Valid passport number is required";
      }
      if (!formData.passportExpiry) {
        errors.passportExpiry = "Passport expiry date is required";
      }
      if (!formData.dob) {
        errors.dob = "Date of birth is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerSelect = (customer: Customer) => {
    const newId = customer.id;
    logAssignmentChange(selectedCustomerId, newId, "Contact Selection");
    setSelectedCustomerId(newId);
    setSelectedCustomer(customer);
    // Also set as default traveller if none selected yet? Or always?
    // Given the form logic fills traveller name, we should set the state too.
    setSelectedTraveler(customer);
    setExistingContactSelected(true);
    // We don't force existingTravelerSelected to true here, letting the user choose.
    // But if they switch to Existing Traveller, it will now default to this customer.

    setFormData((prev) => ({
      ...prev,
      email: customer.email || "",
      phone: customer.phone || "",
      address: toAddressString(customer.address || ""),
    }));
    setFormErrors({});
  };

  const handleTravellerSelect = (traveller: TravellerRow) => {
    if (searchingTravellerIndex === null) return;

    setFormData((prev) => {
      const newTravellers = [...prev.travellers];
      newTravellers[searchingTravellerIndex] = {
        ...newTravellers[searchingTravellerIndex],
        firstName: traveller.first_name || "",
        lastName: traveller.last_name || "",
        passportNumber: traveller.passport_number || "",
        passportExpiry: traveller.passport_expiry || "",
        dob: traveller.dob || "",
        nationality: traveller.nationality || "Nepalese",
        eticketNumber: "", // Reset e-ticket for new booking association
      };

      // Sync primary if index 0
      const updates: Partial<FormData> = { travellers: newTravellers };
      if (searchingTravellerIndex === 0) {
        updates.passportNumber = traveller.passport_number || "";
        updates.passportExpiry = traveller.passport_expiry || "";
        updates.dob = traveller.dob || "";
        updates.nationality = traveller.nationality || "Nepalese";
      }

      return { ...prev, ...updates };
    });
    // Keep searchingTravellerIndex active so subsequent searches work
    // setSearchingTravellerIndex(null);
  };

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    address: "",
    travellers: [],
    // travellerFirstName: "",
    // travellerLastName: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "Nepalese",
    dob: "",
    tripType: "One Way",
    travelDate: "",
    returnDate: "",
    origin: "",
    destination: "",
    transit: "",
    stopoverLocation: "",
    stopoverArrival: "",
    stopoverDeparture: "",
    airlines: "",
    flightNumber: "",
    flightClass: "Economy",
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
    frequentFlyer: "",
    pnr: "",
    agency: "SkyHigh Agency Ltd.",
    handledBy: "John Doe", // Default or fetched
    status: "Confirmed",
    paymentStatus: "Pending",
    paymentMethod: "",
    transactionId: "",
    dateofpayment: "",
    costPrice: 0,
    sellingPrice: 0,
    customerType: "existing",
    contactType: "existing",
    notes: "",
    itineraries: [{ segments: [] }],
  });

  // Airports and airlines autocompletion handled by dedicated components
  const hideContactFields = formData.contactType === "existing";

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        const row = data as unknown as Record<string, unknown>;
        setCreatedAt(typeof row.created_at === "string" ? row.created_at : null);
        // Try to find customer ID from the booking data if available (lowercase 'customerid' in DB)
        // Since we don't have it in the typed response, we might need to cast or rely on prop if passed
        // For now, let's assume it might be in the data object even if untyped
        const rawCustomer = row.customer ?? row.customerid ?? row.customerId;

        let possibleCustomerId: string | number | undefined;

        if (typeof rawCustomer === "string" || typeof rawCustomer === "number") {
          possibleCustomerId = rawCustomer;
        } else if (rawCustomer && typeof rawCustomer === "object") {
          const rawObj = rawCustomer as Record<string, unknown>;
          const objId = rawObj.id;
          if (typeof objId === "string" || typeof objId === "number") {
            possibleCustomerId = objId;
          }
        }

        if (possibleCustomerId !== undefined) {
          setSelectedCustomerId(possibleCustomerId);

          // Only fetch if we didn't already get it from the object (or to refresh)
          // If rawCustomer was an object, we already set it above, but fetching ensures fresh data
          // and consistency if the stored object is stale.
          const { data: customerData } = await supabase
            .from("customers")
            .select("*")
            .eq("id", possibleCustomerId)
            .single();

          if (customerData) {
            setSelectedCustomer(customerData);
            setExistingContactSelected(true);
          }
        }

        let loadedTravellers: Traveller[] = [];
        const travellersRaw = row.travellers;
        if (Array.isArray(travellersRaw) && travellersRaw.length > 0) {
          loadedTravellers = travellersRaw.map((t) => {
            const tr = t as Record<string, unknown>;
            const idValue = tr.id;
            return {
              id:
                typeof idValue === "string"
                  ? idValue
                  : Date.now().toString() + Math.random().toString(),
              firstName:
                (typeof tr.firstName === "string" && tr.firstName) ||
                (typeof tr.first_name === "string" && tr.first_name) ||
                "",
              lastName:
                (typeof tr.lastName === "string" && tr.lastName) ||
                (typeof tr.last_name === "string" && tr.last_name) ||
                "",
              passportNumber:
                (typeof tr.passportNumber === "string" && tr.passportNumber) ||
                (typeof tr.passport_number === "string" && tr.passport_number) ||
                "",
              passportExpiry:
                (typeof tr.passportExpiry === "string" && tr.passportExpiry) ||
                (typeof tr.passport_expiry === "string" && tr.passport_expiry) ||
                "",
              dob: typeof tr.dob === "string" ? tr.dob : "",
              nationality:
                typeof tr.nationality === "string" && tr.nationality
                  ? tr.nationality
                  : "Nepalese",
              customerId:
                (typeof tr.customerId === "string" && tr.customerId) ||
                (typeof tr.customerId === "number" && tr.customerId) ||
                (typeof tr.customer_id === "string" && tr.customer_id) ||
                (typeof tr.customer_id === "number" && tr.customer_id) ||
                undefined,
              saveToDatabase:
                typeof tr.saveToDatabase === "boolean" ? tr.saveToDatabase : false,
              eticketNumber:
                (typeof tr.eticketNumber === "string" && tr.eticketNumber) ||
                (typeof tr.eticket_number === "string" && tr.eticket_number) ||
                "",
            };
          });
        } else {
          // Fallback to flat fields if travellers array is empty
          loadedTravellers = [
            {
              id: Date.now().toString(),
              firstName: "",
              lastName: "",
              passportNumber: data.passportNumber || "",
              passportExpiry: data.passportExpiry || "",
              dob: data.dob || "",
              nationality: data.nationality || "Nepalese",
              customerId: possibleCustomerId,
              eticketNumber: "",
            },
          ];
        }

        setFormData({
          email: data.email || "",
          phone: data.phone || "",
          address:
            typeof row.address === "string"
              ? row.address
              : toAddressString(row.address || ""),
          travellers: loadedTravellers,
          // travellerFirstName: data.travellerFirstName || "",
          // travellerLastName: data.travellerLastName || "",
          passportNumber: data.passportNumber || "",
          passportExpiry: data.passportExpiry || "",
          nationality: data.nationality || "Nepalese",
          dob: data.dob || "",
          tripType: data.tripType || "One Way",
          travelDate: data.travelDate || "",
          returnDate: data.returnDate || "",
          origin: data.origin || "",
          destination: data.destination || "",
          transit: data.transit || "",
          stopoverLocation: data.stopoverLocation || "",
          stopoverArrival: data.stopoverArrival || "",
          stopoverDeparture: data.stopoverDeparture || "",
          airlines: data.airlines || "",
          flightNumber: data.flightNumber || "",
          flightClass: data.flightClass || "Economy",
          addons:
            typeof (row as Record<string, unknown>).addons === "object" &&
            (row as Record<string, unknown>).addons !== null
              ? ((row as Record<string, unknown>).addons as Record<string, boolean>)
              : {
                  meals: false,
                  wheelchair: false,
                  pickup: false,
                  dropoff: false,
                  luggage: false,
                },
          prices:
            typeof (row as Record<string, unknown>).prices === "object" &&
            (row as Record<string, unknown>).prices !== null
              ? ((row as Record<string, unknown>).prices as Record<string, string>)
              : {
                  meals: "0.00",
                  wheelchair: "0.00",
                  pickup: "0.00",
                  dropoff: "0.00",
                  luggage: "0.00",
                },
          frequentFlyer: data.frequentFlyer || "",
          pnr: data.PNR || "",
          agency:
            (typeof row.issuedthroughagency === "string" &&
              row.issuedthroughagency) ||
            data.agency ||
            "SkyHigh Agency Ltd.",
          handledBy: data.handledBy || "John Doe",
          status: data.status || "Confirmed",
          paymentStatus: data.paymentStatus || "Pending",
          paymentMethod: data.paymentMethod || "",
          transactionId: data.transactionId || "",
          dateofpayment: data.dateofpayment || "",
          costPrice: data.buyingPrice || 0,
          sellingPrice: data.sellingPrice || 0,
          customerType: data.customerType || "existing",
          contactType: data.contactType || "existing",
          notes: data.notes || "",
          itineraries: data.itineraries || [{ segments: [] }],
        });
        if (data.stopoverLocation) setShowStopover(true);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (name === "tripType") {
      setFormData((prev) => {
        let newItineraries = [...(prev.itineraries || [])];
        // If switching to Round Trip, ensure we have at least 2 itineraries
        if (value === "Round Trip" && newItineraries.length < 2) {
          newItineraries.push({ segments: [] });
        }
        // If switching to One Way, keep only the first itinerary
        else if (value === "One Way" && newItineraries.length > 1) {
          newItineraries = [newItineraries[0]];
        }

        return {
          ...prev,
          tripType: value,
          itineraries: newItineraries,
        };
      });
      return;
    }

    // Handle checkbox for addons
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith("addon-")) {
        const addonName = name.replace("addon-", "");
        setFormData((prev) => ({
          ...prev,
          addons: {
            ...prev.addons,
            [addonName]: checked,
          },
        }));
        return;
      }
    }

    // Handle prices
    if (name.startsWith("price-")) {
      const priceName = name.replace("price-", "");
      setFormData((prev) => ({
        ...prev,
        prices: { ...prev.prices, [priceName]: value },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTravellerChange = (
    index: number,
    field: keyof Traveller,
    value: unknown,
  ) => {
    setFormData((prev) => {
      const newTravellers = [...prev.travellers];
      newTravellers[index] = { ...newTravellers[index], [field]: value };

      const next = { ...prev, travellers: newTravellers };

      // Sync primary traveller (index 0) with flat fields for backward compatibility/UI
      if (index === 0) {
        if (field === "passportNumber") {
          return { ...next, passportNumber: String(value ?? "") };
        }
        if (field === "passportExpiry") {
          return { ...next, passportExpiry: String(value ?? "") };
        }
        if (field === "dob") {
          return { ...next, dob: String(value ?? "") };
        }
        if (field === "nationality") {
          return { ...next, nationality: String(value ?? "") };
        }
      }
      return next;
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
    field: string,
    value: unknown,
    nestedField?: string,
  ) => {
    setFormData((prev) => {
      const newItineraries = [...prev.itineraries];
      const segment = {
        ...newItineraries[itineraryIndex].segments[segmentIndex],
      } as unknown as Record<string, unknown>;

      if (nestedField) {
        // Handle nested fields like departure.iataCode
        const base =
          typeof segment[field] === "object" && segment[field] !== null
            ? (segment[field] as Record<string, unknown>)
            : {};
        segment[field] = { ...base, [nestedField]: value };
      } else {
        segment[field] = value;
      }

      newItineraries[itineraryIndex].segments[segmentIndex] =
        segment as unknown as FlightItinerary["segments"][number];

      return { ...prev, itineraries: newItineraries };
    });
  };

  const calculateAddonsTotal = () => {
    return Object.values(formData.prices || {})
      .reduce((acc, price) => acc + (parseFloat(price) || 0), 0)
      .toFixed(2);
  };

  const calculateGrandTotal = () => {
    const sellingPrice = parseFloat(formData.sellingPrice.toString()) || 0;
    const addonsTotal = parseFloat(calculateAddonsTotal()) || 0;
    return (sellingPrice + addonsTotal).toFixed(2);
  };

  const calculateProfit = () => {
    const sellingPrice = parseFloat(formData.sellingPrice.toString()) || 0;
    const costPrice = parseFloat(formData.costPrice.toString()) || 0;
    const addonsTotal = parseFloat(calculateAddonsTotal()) || 0;
    // Assuming cost price includes addons cost or addons are pure profit?
    // Usually profit = Total Selling - Total Cost.
    // For simplicity, let's assume Addons have 0 cost or are handled separately.
    // Based on UI screenshot "Estimated Profit", let's just do Selling - Cost for now.
    // Or (Selling + Addons) - Cost.
    return (sellingPrice + addonsTotal - costPrice).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        (t) =>
          t.firstName &&
          t.firstName.trim() !== "" &&
          t.lastName &&
          t.lastName.trim() !== "",
      );

    let finalStatus = formData.status;

    if (
      (hasMissingFields || !hasValidTraveller) &&
      finalStatus !== "Cancelled"
    ) {
      finalStatus = "Draft";
    }

    if (finalStatus !== "Draft" && finalStatus !== "Cancelled") {
      if (!validateForm()) {
        const firstErrorField = document.querySelector(".error-field");
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        return;
      }
    }

    setSaving(true);

    try {
      // Temporary helper to filter out empty fields
      // TODO: Complete handling of empty fields should be implemented in a future update
      const filterEmptyFields = (data: Record<string, unknown>) => {
        const clean: Record<string, unknown> = {};
        Object.keys(data).forEach((key) => {
          const value = data[key];
          if (value !== null && value !== undefined && value !== "") {
            clean[key] = value;
          }
        });
        return clean;
      };

      // Helper to convert empty strings to null for date fields
      const toDateOrNull = (dateStr: string | undefined) => {
        if (!dateStr || dateStr.trim() === "") return null;
        return dateStr;
      };

      // Handle New Customer Creation logic
      let customerIdToUse = selectedCustomerId;

      if (formData.contactType === "new" && formData.email) {
        console.log("Processing new customer creation for:", formData.email);

        // 1. Check if customer already exists
        const { data: existingCustomer, error: searchError } = await supabase
          .from("customers")
          .select("id")
          .eq("email", formData.email)
          .single();

        if (searchError && searchError.code !== "PGRST116") {
          console.error("Error searching for existing customer:", searchError);
        }

        if (existingCustomer) {
          console.log(
            "Customer already exists, linking to ID:",
            existingCustomer.id,
          );
          customerIdToUse = existingCustomer.id;
        } else {
          // 2. Create new customer
          const firstName = formData.travellers?.[0]?.firstName || "Unknown";
          const lastName = formData.travellers?.[0]?.lastName || "Traveller";

          const newCustomer = {
            firstName,
            lastName,
            email: formData.email,
            phone: formData.phone || "",
            country: formData.nationality || "Nepalese",
            isActive: "true",
            isVerified: "false",
            userType: "Traveler",
            isDisabled: "false",
            phoneCountryCode: "+977",
            dateOfBirth: formData.travellers?.[0]?.dob || formData.dob || "",
            gender: "N/A",
            address: {},
            passport: {
              number:
                formData.passportNumber ||
                formData.travellers?.[0]?.passportNumber ||
                "",
              expiryDate:
                formData.passportExpiry ||
                formData.travellers?.[0]?.passportExpiry ||
                "",
              issueCountry: formData.nationality || "Nepalese",
            },
            // created_at: new Date().toISOString(),
          };

          const { data: createdCustomer, error: createError } = await supabase
            .from("customers")
            .insert([newCustomer])
            .select("id")
            .single();

          if (createError) {
            console.error("Failed to create new customer:", createError);
            throw new Error(
              `Failed to create customer profile: ${createError.message}`,
            );
          }

          console.log("New customer created successfully:", createdCustomer.id);
          customerIdToUse = createdCustomer.id;
        }
      }

      // Construct the customer object for the JSON column
      let customerDataForColumn: Record<string, unknown> | null = null;

      if (formData.contactType === "existing" && selectedCustomer) {
        // Ensure ID is current
        customerDataForColumn = { ...selectedCustomer, id: customerIdToUse };
      } else {
        // For new contact, construct from form data
        // Note: In edit mode, we rely on the first traveller for name if not explicitly separate fields
        customerDataForColumn = {
          id: customerIdToUse,
          firstName: formData.travellers?.[0]?.firstName || "Unknown",
          lastName: formData.travellers?.[0]?.lastName || "Traveller",
          email: formData.email,
          phone: formData.phone,
          country: formData.nationality || "Nepalese",
          // address: formData.address,
        };
      }

      const rawUpdateData = {
        email: formData.email,
        phone: formData.phone,
        // address: formData.address, // Still excluded
        // travellerFirstName: formData.travellerFirstName, // REMOVED: Using travellers array
        // travellerLastName: formData.travellerLastName,   // REMOVED: Using travellers array
        passportNumber: formData.passportNumber,
        passportExpiry: toDateOrNull(formData.passportExpiry),
        nationality: formData.nationality,
        dob: toDateOrNull(formData.dob),
        travellers: formData.travellers,
        tripType: formData.tripType,
        travelDate: toDateOrNull(formData.travelDate),
        returnDate: toDateOrNull(formData.returnDate),
        origin: formData.origin,
        destination: formData.destination,
        transit: formData.transit,
        // stopoverLocation: formData.stopoverLocation,
        // stopoverArrival: toDateOrNull(formData.stopoverArrival),
        // stopoverDeparture: toDateOrNull(formData.stopoverDeparture),
        airlines: formData.airlines,
        flightNumber: formData.flightNumber,
        flightClass: formData.flightClass,
        addons: formData.addons,
        prices: formData.prices,
        frequentFlyer: formData.frequentFlyer,
        PNR: formData.pnr,
        agency: formData.agency,
        handledBy: formData.handledBy,
        status: finalStatus,
        paymentStatus: formData.paymentStatus,
        // paymentMethod: formData.paymentMethod,
        // transactionId: formData.transactionId,
        dateofpayment: toDateOrNull(formData.dateofpayment),
        buyingPrice: formData.costPrice,
        costprice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
        customerType: formData.customerType,
        contactType: formData.contactType,
        notes: formData.notes,
        customer: customerDataForColumn,
        itineraries: formData.itineraries,
      };

      // Exclude address specifically as requested by error log
      // @ts-expect-error dynamic payload field
      delete rawUpdateData.address;

      // Ensure deprecated fields are not sent to the backend
      // @ts-expect-error deprecated payload field
      delete rawUpdateData.travellerFirstName;
      // @ts-expect-error deprecated payload field
      delete rawUpdateData.travellerLastName;
      // @ts-expect-error deprecated payload field
      delete rawUpdateData.ticketNumber;

      // Schema Mapping & Validation Bypass
      // Note: The 'travellers' column and others should be present in the DB after applying the migration.
      // We map known field names to actual DB column names and filter out anything that doesn't match the known schema.

      const DB_COLUMN_MAPPING: { [key: string]: string } = {
        agency: "issuedthroughagency",
        status: "bookingstatus",
        paymentStatus: "paymentstatus",
        // paymentMethod: "paymentmethod", // Removed as we use "paymentMethod" column now
        // transactionId: "transactionid", // Removed as we use "transactionId" column now
        // dateOfPayment: "dateofpayment", // Removed as we use "dateOfPayment" column now? Wait, migration has dateofpayment lowercase.
        costPrice: "costprice",
        sellingPrice: "sellingprice",
        handledBy: "handledBy",
        pnr: "pnr",
      };

      // Check known columns and gracefully omit travellers if not supported by backend
      // This is a safety check. In production, we assume migration has run.
      // But for dev/testing, we can check if the column exists in our whitelist AND if the error persists, maybe we should warn user?
      // Actually, we can't check if backend has column at runtime easily here without another request.
      // We will rely on the whitelist.
      const KNOWN_DB_COLUMNS = [
        "id",
        "created_at",
        // "travellerFirstName", // REMOVED
        // "travellerLastName",  // REMOVED
        "passportNumber", // Added back as it might exist and is useful for legacy
        "passportExpiry", // Added back
        "nationality", // Added back
        "PNR",
        // "ticketNumber", // Deprecated, moved to travellers array
        "airlines",
        "origin",
        "transit",
        "destination",
        "tripType",
        "issueMonth",
        "IssueDay",
        "issueYear",
        "buyingPrice",
        "payment",
        "bookingid",
        "pnr",
        "issuedthroughagency",
        "handledBy",
        "bookingstatus",
        "costprice",
        "sellingprice",
        "paymentstatus",
        "paymentmethod",
        "transactionid",
        "dateofpayment",
        "notes",
        "currencycode",
        "customerid",
        "travellers",
        "customer",
        "itineraries",
        "contactType",
        "customerType",
        "email",
        "phone",
        "dob",
        "addons",
        "paymentMethod",
        "transactionId",
        "prices",
        "travelDate",
        "returnDate",
        "stopoverLocation",
        "stopoverArrival",
        "stopoverDeparture",
        "flightClass",
        "flightNumber",
        "frequentFlyer",
      ];

      const mapAndFilterPayload = (data: Record<string, unknown>) => {
        const processed: Record<string, unknown> = {};

        Object.keys(data).forEach((key) => {
          let dbKey = key;

          // 1. Apply mapping
          if (DB_COLUMN_MAPPING[key]) {
            dbKey = DB_COLUMN_MAPPING[key];
          }

          // 2. Check if valid column (Case-sensitive check against known columns)
          // We also allow if the key itself matches a known column directly
          const isValid =
            KNOWN_DB_COLUMNS.includes(dbKey) || KNOWN_DB_COLUMNS.includes(key);

          if (isValid) {
            processed[dbKey] = data[key];
          } else {
            console.warn(
              `[Schema Bypass] Skipping field '${key}' (mapped to '${dbKey}') as it does not exist in target schema.`,
            );
          }
        });

        return processed;
      };

      // Apply mapping/filtering THEN empty check
      const mappedData = mapAndFilterPayload(rawUpdateData as Record<string, unknown>);
      const updateData = filterEmptyFields(mappedData);

      console.log("Submitting update (mapped & filtered):", updateData);

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      router.push("/dashboard/booking");
    } catch (err: unknown) {
      console.error("Error updating booking:", err);
      // Improve error logging to see the structure
      if (typeof err === "object" && err !== null) {
        const errObj = err as Record<string, unknown>;
        console.error("Error details:", JSON.stringify(errObj, null, 2));
        if (typeof errObj.message === "string") {
          console.error("Error message:", errObj.message);
        }
        if (typeof errObj.code === "string") {
          console.error("Error code:", errObj.code);
        }
        if (typeof errObj.details === "string") {
          console.error("Error details:", errObj.details);
        }
      }
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message || "")
          : "";
      alert(`Failed to update booking: ${message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-w-0 bg-slate-50 p-6 font-display">
      <div className="mb-8 max-w-7xl mx-auto">
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link
            className="hover:text-slate-700 transition-colors"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            className="hover:text-slate-700 transition-colors"
            href="/dashboard/booking"
          >
            Bookings
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">Edit</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Edit Booking #{id}
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-primary border border-blue-200">
                Editing
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Update traveller information and itinerary details.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    contact_mail
                  </span>
                  Customer Contact Details
                </h3>
              </div>
              <div className="p-6">
                {/* Contact Type Toggle */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        contactType: "existing",
                        ...(selectedCustomer
                          ? {
                              email: selectedCustomer.email || "",
                              phone: selectedCustomer.phone || "",
                              address: toAddressString(
                                selectedCustomer.address || "",
                              ),
                            }
                          : {}),
                      }));
                      setFormErrors({});
                      if (selectedCustomer) {
                        setExistingContactSelected(true);
                      } else {
                        setExistingContactSelected(false);
                      }
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      formData.contactType === "existing"
                        ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      person_search
                    </span>
                    Existing Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        contactType: "new",
                        email: "",
                        phone: "",
                        address: "",
                      }));
                    }}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                      formData.contactType === "new"
                        ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      person_add
                    </span>
                    New Contact
                  </button>
                </div>

                {/* Search for Existing Contact */}
                {formData.contactType === "existing" && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {!existingContactSelected ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                          Search Customer
                        </label>
                        <CustomerSearch
                          onSelect={handleCustomerSelect}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setExistingContactSelected(false);
                              setSelectedCustomer(null);
                              setSelectedCustomerId(undefined);
                              setFormData((prev) => ({
                                ...prev,
                                contactType: "existing",
                                email: "",
                                phone: "",
                                address: "",
                              }));
                            }}
                            className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 shadow-sm rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              edit
                            </span>
                            Change
                          </button>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-sm">
                            {selectedCustomer?.firstName?.[0] || ""}
                            {selectedCustomer?.lastName?.[0] || ""}
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">
                              {selectedCustomer?.firstName}{" "}
                              {selectedCustomer?.lastName}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">
                                  email
                                </span>
                                {selectedCustomer?.email || "N/A"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">
                                  phone
                                </span>
                                {selectedCustomer?.phone || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    !hideContactFields
                      ? "max-h-[800px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                        Email Address
                      </label>
                      <div
                        className={`relative rounded-md shadow-sm ${
                          formErrors.email ? "error-field" : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            email
                          </span>
                        </div>
                        <input
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.email
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-200 focus:border-primary focus:ring-primary/10"
                          }`}
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.email)
                              setFormErrors((prev) => ({ ...prev, email: "" }));
                          }}
                          placeholder="customer@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            error
                          </span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                        Phone Number
                      </label>
                      <div
                        className={`relative rounded-md shadow-sm ${
                          formErrors.phone ? "error-field" : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            phone
                          </span>
                        </div>
                        <input
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.phone
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-200 focus:border-primary focus:ring-primary/10"
                          }`}
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.phone)
                              setFormErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                          placeholder="+61 XXX XXX XXX"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            error
                          </span>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                        Address
                      </label>
                      <div
                        className={`relative rounded-md shadow-sm ${
                          formErrors.address ? "error-field" : ""
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            home
                          </span>
                        </div>
                        <input
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.address
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                              : "border-slate-200 focus:border-primary focus:ring-primary/10"
                          }`}
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.address)
                              setFormErrors((prev) => ({
                                ...prev,
                                address: "",
                              }));
                          }}
                          placeholder="e.g. 123 Main St, City"
                        />
                      </div>
                      {formErrors.address && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            error
                          </span>
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    hideContactFields
                      ? "max-h-[100px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-500">
                      visibility_off
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Contact fields hidden
                      </p>
                      <p className="text-xs text-slate-600">
                        Using existing contact or traveller details. Switch to
                        &quot;New Contact&quot; to edit manually.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Traveller Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    person
                  </span>
                  Traveller Information
                </h3>
              </div>
              <div className="p-6">
                {formData.travellers.map((traveller, index) => (
                  <div
                    key={traveller.id || index}
                    className="mb-8 p-6 border rounded-xl bg-slate-50 relative group"
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            First Name
                          </label>
                          <input
                            className={`block w-full h-10 rounded-lg border px-3 focus:ring focus:border-primary transition-colors uppercase ${
                              formErrors[`traveller_${index}_firstName`]
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                : "border-slate-200"
                            }`}
                            value={traveller.firstName}
                            onChange={(e) => {
                              handleTravellerChange(
                                index,
                                "firstName",
                                e.target.value,
                              );
                              if (formErrors[`traveller_${index}_firstName`]) {
                                const newErrors = { ...formErrors };
                                delete newErrors[
                                  `traveller_${index}_firstName`
                                ];
                                setFormErrors(newErrors);
                              }
                            }}
                            placeholder="Given Name"
                          />
                          {formErrors[`traveller_${index}_firstName`] && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors[`traveller_${index}_firstName`]}
                            </p>
                          )}
                        </div>
                        {/* Last Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Last Name
                          </label>
                          <input
                            className={`block w-full h-10 rounded-lg border px-3 focus:ring focus:border-primary transition-colors uppercase ${
                              formErrors[`traveller_${index}_lastName`]
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                : "border-slate-200"
                            }`}
                            value={traveller.lastName}
                            onChange={(e) => {
                              handleTravellerChange(
                                index,
                                "lastName",
                                e.target.value,
                              );
                              if (formErrors[`traveller_${index}_lastName`]) {
                                const newErrors = { ...formErrors };
                                delete newErrors[`traveller_${index}_lastName`];
                                setFormErrors(newErrors);
                              }
                            }}
                            placeholder="Surname"
                          />
                          {formErrors[`traveller_${index}_lastName`] && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                              {formErrors[`traveller_${index}_lastName`]}
                            </p>
                          )}
                        </div>
                        {/* Passport Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Passport Number
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                badge
                              </span>
                            </div>
                            <input
                              className="block w-full h-10 rounded-lg border border-slate-200 pl-10 px-3 focus:ring focus:border-primary transition-colors uppercase"
                              value={traveller.passportNumber || ""}
                              onChange={(e) =>
                                handleTravellerChange(
                                  index,
                                  "passportNumber",
                                  e.target.value,
                                )
                              }
                              placeholder="Passport No."
                            />
                          </div>
                        </div>
                        {/* Passport Expiry */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Passport Expiry
                          </label>
                          <input
                            type="date"
                            className="block w-full h-10 rounded-lg border border-slate-200 px-3 focus:ring focus:border-primary transition-colors"
                            value={traveller.passportExpiry || ""}
                            onChange={(e) =>
                              handleTravellerChange(
                                index,
                                "passportExpiry",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        {/* Nationality */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Nationality
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                flag
                              </span>
                            </div>
                            <select
                              className="block w-full h-10 rounded-lg border border-slate-200 pl-10 px-3 focus:ring focus:border-primary transition-colors appearance-none bg-white"
                              value={traveller.nationality || "Nepalese"}
                              onChange={(e) =>
                                handleTravellerChange(
                                  index,
                                  "nationality",
                                  e.target.value,
                                )
                              }
                            >
                              {countryData.countries.map((c) => (
                                <option key={c.value} value={c.label}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* DOB */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            className="block w-full h-10 rounded-lg border border-slate-200 px-3 focus:ring focus:border-primary transition-colors"
                            value={traveller.dob || ""}
                            onChange={(e) =>
                              handleTravellerChange(
                                index,
                                "dob",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        {/* E-Ticket Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                            E-Ticket Number
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                confirmation_number
                              </span>
                            </div>
                            <input
                              className="block w-full h-10 rounded-lg border border-slate-200 pl-10 px-3 focus:ring focus:border-primary transition-colors"
                              value={traveller.eticketNumber || ""}
                              onChange={(e) =>
                                handleTravellerChange(
                                  index,
                                  "eticketNumber",
                                  e.target.value,
                                )
                              }
                              placeholder="E-Ticket No."
                            />
                          </div>
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
                  <span className="material-symbols-outlined">person_add</span>
                  Add Another Traveller
                </button>
              </div>
            </div>

            {/* Route & Trip Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    flight_takeoff
                  </span>
                  Route & Trip Details
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                      Trip Type
                    </label>
                    <select
                      className="block w-full h-10 rounded-lg border-slate-300 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3"
                      name="tripType"
                      value={formData.tripType}
                      onChange={handleChange}
                    >
                      <option value="One Way">One Way</option>
                      <option value="Round Trip">Round Trip</option>
                      <option value="Multi City">Multi City</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                        Departure Date
                      </label>
                      <input
                        className="block w-full h-10 rounded-lg border-slate-300 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3"
                        name="travelDate"
                        type="date"
                        value={formData.travelDate}
                        onChange={handleChange}
                      />
                    </div>
                    {formData.tripType === "Round Trip" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                          Return Date
                        </label>
                        <input
                          className="block w-full h-10 rounded-lg border-slate-300 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3"
                          name="returnDate"
                          type="date"
                          value={formData.returnDate}
                          onChange={handleChange}
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
                              onClick={() => removeSegment(itinIndex, segIndex)}
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

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Global Flight Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <AirlineAutocomplete
                        label="Primary Airline"
                        name="airlines"
                        value={formData.airlines}
                        onChange={handleChange}
                        icon="airlines"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
                        Class
                      </label>
                      <select
                        className="block w-full h-10 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium px-4"
                        name="flightClass"
                        value={formData.flightClass}
                        onChange={handleChange}
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
                      <p className="text-xs text-blue-700 mt-0.5">
                        Changing origin, destination, or dates may affect
                        pricing. Ensure to re-calculate fares after modifying
                        the itinerary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons & Services */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    extension
                  </span>
                  Add-ons & Services
                </h3>
              </div>
              <div className="p-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  ANCILLARY SERVICES
                </label>
                <div className="space-y-4">
                  {servicesLoading ? (
                    <div className="text-sm text-slate-500 font-medium">
                      Loading services...
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-sm text-slate-500 font-medium">
                      No active services found.
                    </div>
                  ) : (
                    services.map((service) => {
                      const key = service.name;
                      const selected = Object.prototype.hasOwnProperty.call(
                        formData.prices,
                        key,
                      );
                      const value = selected
                        ? formData.prices[key]
                        : String(service.base_price ?? 0);

                      return (
                        <div
                          key={service.id || service.name}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => {
                                  const nextPrices = { ...prev.prices };
                                  if (checked) {
                                    nextPrices[key] =
                                      nextPrices[key] ||
                                      String(service.base_price ?? 0);
                                  } else {
                                    delete nextPrices[key];
                                  }
                                  return { ...prev, prices: nextPrices };
                                });
                              }}
                              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-700 truncate">
                                {service.name}
                              </div>
                              {service.type && (
                                <div className="text-xs text-slate-400 font-medium truncate">
                                  {service.type}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="relative w-28">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-400 text-xs">$</span>
                            </div>
                            <input
                              type="number"
                              value={value}
                              disabled={!selected}
                              onChange={(e) => {
                                const nextValue = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  prices: {
                                    ...prev.prices,
                                    [key]: nextValue,
                                  },
                                }));
                              }}
                              className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">
                      Add-ons Subtotal
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ${calculateAddonsTotal()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests / Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    note
                  </span>
                  Special Requests / Notes
                </h3>
              </div>
              <div className="p-6">
                <textarea
                  className="block w-full h-24 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3 py-2"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any special requests or internal notes here..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Booking Details
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Booking ID (Read Only)
                  </label>
                  <input
                    className="block w-full h-10 rounded-lg border-slate-200 bg-slate-50 text-slate-500 px-3 sm:text-sm"
                    readOnly
                    value={`#${id}`}
                  />
                  {createdAt && (
                    <div className="mt-1 text-xs text-slate-400 font-medium">
                      Created: {formatDateTime(createdAt)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    PNR Reference
                  </label>
                  <input
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium uppercase"
                    name="pnr"
                    value={formData.pnr}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Issued through Agency
                  </label>
                  <select
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                    name="agency"
                    value={formData.agency}
                    onChange={handleChange}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Booking Status
                  </label>
                  <select
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Draft">Draft</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Financials
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Currency Used
                  </label>
                  <select
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 bg-white text-slate-700 sm:text-sm font-medium"
                    disabled
                  >
                    <option>USD (United States Dollar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Payment Status
                  </label>
                  <select
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Payment Method
                  </label>
                  <select
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div> */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Transaction ID
                  </label>
                  <input
                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="e.g. TXN-12345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Date of Payment
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        calendar_today
                      </span>
                    </div>
                    <input
                      className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                      name="dateofpayment"
                      type="date"
                      value={formData.dateofpayment}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Cost Price ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-xs">$</span>
                    </div>
                    <input
                      className="block w-full h-10 rounded-lg border-slate-200 pl-8 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                      name="costPrice"
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">
                    Selling Price ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-xs">$</span>
                    </div>
                    <input
                      className="block w-full h-10 rounded-lg border-slate-200 pl-8 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-bold text-blue-600"
                      name="sellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">Base Cost</span>
                    <span className="font-bold text-slate-900">
                      ${parseFloat(formData.sellingPrice.toString()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">
                      Add-ons Subtotal
                    </span>
                    <span className="font-bold text-slate-900">
                      ${calculateAddonsTotal()}
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                    <span className="font-black text-slate-900">
                      Grand Total
                    </span>
                    <span className="font-black text-blue-600">
                      ${calculateGrandTotal()}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-700">
                    Estimated Profit
                  </span>
                  <span className="text-sm font-black text-blue-700">
                    ${calculateProfit()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  save
                </span>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/booking")}
                className="w-full h-12 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Meal Modal */}
      {isMealModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center overflow-hidden p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMealModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden ring-1 ring-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Select Meal Options
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-widest">
                  Premium Flight Services
                </p>
              </div>
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-all p-1 rounded-lg hover:bg-slate-50"
              >
                <span className="material-symbols-outlined font-bold">
                  close
                </span>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
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
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      name="meal-selection"
                      type="radio"
                      className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {meal.name}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {meal.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => setIsMealModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
