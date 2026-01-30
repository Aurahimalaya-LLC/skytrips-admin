"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Customer, Booking, Address, Passport, Traveller } from "@/types";
import TravellerSearch from "@/components/TravellerSearch";
import locationsData from "@/data/locations.json";
import countriesData from "@/data/countries.json";
import { getCountryCallingCode, CountryCode } from "libphonenumber-js";

type Identity = {
  provider: string;
  created_at: string;
  last_sign_in_at: string;
  email?: string;
};

type NewTravellerFormData = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  dob?: string;
  nationality?: string;
  gender?: string;
  title?: string;
};

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  // Generate country phone options
  const countryPhoneOptions = useMemo(() => {
    return countriesData
      .map((c) => {
        try {
          const callingCode = getCountryCallingCode(c.code as CountryCode);
          return {
            iso: c.code,
            name: c.name,
            callingCode: `+${callingCode}`,
            display: `${c.name} (+${callingCode})`,
          };
        } catch (error) {
          return null;
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Record<
    string,
    string | number
  > | null>(null);

  // Location State for Edit Modal
  const [editCountry, setEditCountry] = useState("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPhoneCountryCode, setEditPhoneCountryCode] = useState("");
  const [editPhoneIso, setEditPhoneIso] = useState("US");

  // Editable Fields State
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editDob, setEditDob] = useState("");

  // Booking History State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Linked Travellers State
  const [linkedTravellers, setLinkedTravellers] = useState<Traveller[]>([]);
  const [linkedTravellersLoading, setLinkedTravellersLoading] = useState(false);

  // New state for Link/Create Traveller Modal
  const [showLinkTravellerModal, setShowLinkTravellerModal] = useState(false);
  const [linkModalTab, setLinkModalTab] = useState<"existing" | "new">("existing");
  const [newTravellerData, setNewTravellerData] = useState<NewTravellerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    passportNumber: "",
    passportExpiry: "",
    dob: "",
    nationality: "",
    gender: "",
    title: "",
  });
  const [createTravellerLoading, setCreateTravellerLoading] = useState(false);
  const [createTravellerError, setCreateTravellerError] = useState<string | null>(
    null,
  );
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [pendingDisable, setPendingDisable] = useState<boolean>(false);

  const handleInvite = async () => {
    if (!customer) return;
    setInviting(true);
    try {
      const res = await fetch("/api/customers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send invite");
      alert("Invitation sent successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };
  const handleConfirmDisable = async () => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({ isDisabled: pendingDisable ? "true" : "false" })
        .eq("id", customerId);
      if (error) throw error;
      await fetchCustomerDetails();
      setShowDisableModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update status");
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const updatedAddress = {
        street: editStreet,
        city: editCity,
        state: editState,
        postalCode: editPostalCode,
        country: editCountry,
      };

      const { error } = await supabase
        .from("customers")
        .update({
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          phone: editPhone,
          phoneCountryCode: editPhoneCountryCode,
          dateOfBirth: editDob,
          gender: editGender,
          country: editCountry,
          address: JSON.stringify(updatedAddress),
        })
        .eq("id", customerId);

      if (error) throw error;

      await fetchCustomerDetails();
      setShowEditModal(false);
      alert("Customer updated successfully!");
    } catch (err) {
      console.error("Error updating customer:", err);
      alert("Failed to update customer details");
    }
  };

  // Parse JSON fields safely
  const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
      }
    }
    return (value as T) || fallback;
  };

  const address = customer
    ? safeJsonParse<Partial<Address>>(customer.address, {})
    : {};
  const passport = customer
    ? safeJsonParse<Partial<Passport>>(customer.passport, {})
    : {};
  const creationSourceLabel = (() => {
    const s = String(customer?.source || "").toLowerCase();
    const adminSources = ["admin", "admin_import", "import", "imported", "manual"];
    const isAdminSource = adminSources.includes(s);
    const isSelfRegistered = Boolean(customer?.auth_user_id) || Boolean(customer?.socialProvider);
    if (isAdminSource) return "Created by Admin";
    if (isSelfRegistered) return "Self-Registered";
    return "Created by Admin";
  })();

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  useEffect(() => {
    if (activeTab === "booking-history" && customerId) {
      fetchBookingHistory();
    }
    if (activeTab === "linked-travellers" && customerId) {
      fetchLinkedTravellers();
    }
  }, [activeTab, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      console.log("Fetching customer details for ID:", customerId);

      // Validate UUID format to prevent database errors
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(customerId)) {
        console.warn("Invalid UUID format for customerId:", customerId);
        // If it's not a UUID, it might be a legacy ID or invalid.
        // We can throw immediately or try to find by other means if supported.
        throw new Error("Invalid Customer ID format");
      }

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (error) {
        console.error("Supabase error fetching customer:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      if (!data) {
        throw new Error("Customer not found");
      }

      setCustomer(data);
      console.log("Customer data:", data);

      // Fetch identities
      const { data: identitiesData, error: identitiesError } = await supabase.rpc(
        "get_customer_identities",
        { p_customer_id: customerId },
      );

      if (identitiesError) {
        console.error("Error fetching identities:", identitiesError);
      } else {
        console.log("Identities fetched:", identitiesData);
        setIdentities((identitiesData as Identity[]) || []);
      }
    } catch (err: unknown) {
      console.error("Error fetching customer:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load customer details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async () => {
    setBookingsLoading(true);
    try {
      console.log("Fetching booking history for customer:", customerId);

      const conditions = [];
      const idStr = String(customerId);
      const idNum = Number(customerId);

      // 1. Legacy: Check Foreign Key 'customerid' (Standard relation)
      // We check both string (UUID) and number formats
      // CAUTION: Querying integer column with string (UUID) causes error 22P02.
      // Only query 'customerid' if we have a number, or if we are sure it's not an int column.
      // Since we validated customerId is UUID (lines 47-48), idNum is NaN.
      // conditions.push(`customerid.eq.${JSON.stringify(idStr)}`);

      if (!isNaN(idNum)) {
        conditions.push(`customerid.eq.${idNum}`);
      } else {
        // If it's a UUID, it might be stored in 'customerid' if that column is UUID type.
        // But if 'customerid' is INT, this crashes.
        // We'll rely on customer->>id for UUIDs to be safe.
        // If you are sure customerid is UUID, uncomment the line below:
        // conditions.push(`customerid.eq.${JSON.stringify(idStr)}`);
      }

      // 2. New: Check JSON field 'id' in 'customer' column
      // Use ->> to extract field as text (works for json/jsonb)
      conditions.push(`customer->>id.eq.${JSON.stringify(idStr)}`);

      // 3. Email match (Root column or inside JSON)
      if (customer?.email) {
        // Use ilike for case-insensitive matching with wildcards to handle whitespace
        const cleanEmail = customer.email.trim();
        // Add wildcards for loose matching (substring)
        const emailPattern = `*${cleanEmail}*`;
        const emailStr = JSON.stringify(emailPattern);

        // Check root email column
        conditions.push(`email.ilike.${emailStr}`);

        // Check email inside customer JSON: {"email": "..."}
        conditions.push(`customer->>email.ilike.${emailStr}`);
      }

      const queryFilter = conditions.join(",");
      console.log("Booking History Query Filter:", queryFilter);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(queryFilter)
        .order("travelDate", { ascending: false });

      if (error) {
        console.error("Supabase Raw Error:", error);
        throw error;
      }
      console.log("Booking history fetched:", data);
      setBookings(data || []);
    } catch (err: unknown) {
      console.error("Full Error Object:", err);
      if (typeof err === "object" && err !== null) {
        console.error("Error keys:", Object.keys(err));
        console.error("Error stringified:", JSON.stringify(err, null, 2));
      }

      const sbError = err as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };
      console.error("Error fetching booking history:", {
        message: sbError?.message,
        details: sbError?.details,
        hint: sbError?.hint,
        code: sbError?.code,
        fullError: err,
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchLinkedTravellers = async () => {
    setLinkedTravellersLoading(true);
    try {
      console.log("Fetching linked travellers for customer:", customerId);
      const { data, error } = await supabase
        .from("travellers")
        .select("*")
        .eq("customer_id", customerId);

      if (error) throw error;

      const mappedTravellers: Traveller[] = (data || []).map((t: unknown) => {
        const traveller = t as Record<string, unknown>;
        return {
          id: (traveller.id as string) || "",
          firstName: (traveller.first_name as string) || "",
          lastName: (traveller.last_name as string) || "",
          email: (traveller.email as string) || undefined,
          phone: (traveller.phone as string) || undefined,
          passportNumber: (traveller.passport_number as string) || undefined,
          passportExpiry: (traveller.passport_expiry as string) || undefined,
          dob: (traveller.dob as string) || undefined,
          nationality: (traveller.nationality as string) || undefined,
          customerId: (traveller.customer_id as string) || customerId,
          title: (traveller.title as string) || undefined,
        };
      });

      setLinkedTravellers(mappedTravellers);
    } catch (err: unknown) {
      console.error("Error fetching linked travellers:", err);
    } finally {
      setLinkedTravellersLoading(false);
    }
  };

  const handleLinkExistingTraveller = async (traveller: unknown) => {
    const t = traveller as { id: string };
    try {
      const { error } = await supabase
        .from("travellers")
        .update({ customer_id: customerId })
        .eq("id", t.id);

      if (error) throw error;

      await fetchLinkedTravellers();
      setShowLinkTravellerModal(false);
    } catch (err) {
      console.error("Error linking traveller:", err);
      alert("Failed to link traveller. Please try again.");
    }
  };

  const handleCreateNewTraveller = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateTravellerLoading(true);
    setCreateTravellerError(null);

    try {
      if (!newTravellerData.firstName || !newTravellerData.lastName) {
        throw new Error("First Name and Last Name are required.");
      }

      const payload = {
        first_name: newTravellerData.firstName,
        last_name: newTravellerData.lastName,
        email: newTravellerData.email || null,
        phone: newTravellerData.phone || null,
        passport_number: newTravellerData.passportNumber || null,
        passport_expiry: newTravellerData.passportExpiry || null,
        dob: newTravellerData.dob || null,
        nationality: newTravellerData.nationality || null,
        gender: newTravellerData.gender || null,
        title: newTravellerData.title || null,
        customer_id: customerId,
      };

      const { error } = await supabase.from("travellers").insert([payload]);

      if (error) throw error;

      await fetchLinkedTravellers();
      setShowLinkTravellerModal(false);
      setNewTravellerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        passportNumber: "",
        passportExpiry: "",
        dob: "",
        nationality: "",
        gender: "",
        title: "",
      });
    } catch (err: unknown) {
      console.error("Error creating traveller:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create traveller.";
      setCreateTravellerError(errorMessage);
    } finally {
      setCreateTravellerLoading(false);
    }
  };

  const handleInvoiceAction = (invoice: Record<string, string | number>) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const renderTabContent = () => {
    if (!customer) return null;
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    person
                  </span>
                  Personal Information
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      First Name
                    </p>
                    <p className="text-slate-900 font-medium">
                      {customer.firstName}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Last Name
                    </p>
                    <p className="text-slate-900 font-medium">
                      {customer.lastName}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Date of Birth
                    </p>
                    <p className="text-slate-900 font-medium">
                      {customer.dateOfBirth || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Gender
                    </p>
                    <p className="text-slate-900 font-medium">
                      {customer.gender || "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Phone Country Code
                    </p>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      {customer.phoneCountryCode} ({customer.country})
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Nationality
                    </p>
                    <p className="text-slate-900 font-medium">
                      {customer.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    badge
                  </span>
                  Passport Details
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                  CONFIDENTIAL
                </span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Passport Number
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-mono font-bold text-lg">
                        {passport.number || "N/A"}
                      </p>
                      {customer.isVerified === "true" && (
                        <span
                          className="material-symbols-outlined text-green-500 text-[18px]"
                          title="Verified"
                        >
                          check_circle
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Issue Country
                    </p>
                    <p className="text-slate-900 font-medium flex items-center gap-2">
                      {passport.issueCountry || customer.country}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Expiry Date
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-medium">
                        {passport.expiryDate || "N/A"}
                      </p>
                      {passport.expiryDate &&
                        new Date(passport.expiryDate) > new Date() && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            VALID
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    home_pin
                  </span>
                  Address Details
                </h3>
              </div>
              <div className="p-0">
                <div className="w-full p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        Street Address
                      </p>
                      <p className="text-slate-900 font-medium">
                        {address.street || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        City
                      </p>
                      <p className="text-slate-900 font-medium">
                        {address.city || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        State / Province
                      </p>
                      <p className="text-slate-900 font-medium">
                        {address.state || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        Postal Code
                      </p>
                      <p className="text-slate-900 font-medium">
                        {address.postalCode || "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                        Country
                      </p>
                      <p className="text-slate-900 font-medium">
                        {customer.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "booking-history":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  placeholder="Search reference..."
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>All Status</option>
                  <option>Confirmed</option>
                  <option>Cancelled</option>
                  <option>Pending</option>
                </select>
                <input
                  type="date"
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {bookingsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-slate-500 text-sm">
                  Loading booking history...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <span className="material-symbols-outlined text-slate-400">
                    history_off
                  </span>
                </div>
                <h3 className="text-slate-900 font-bold">No bookings found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  This customer hasn&apos;t made any bookings yet.
                </p>
              </div>
            ) : (
              bookings.map((booking, index) => {
                const b = booking as unknown as Record<string, unknown>;
                const status =
                  booking.status ||
                  (b.status as string) ||
                  (b.bookingstatus as string) ||
                  "Pending";
                const origin = booking.origin || (b.origin as string) || "N/A";
                const destination =
                  booking.destination || (b.destination as string) || "N/A";
                const pnr =
                  booking.PNR ||
                  (b.PNR as string) ||
                  (b.pnr as string) ||
                  "N/A";
                const travelDate =
                  booking.travelDate ||
                  (b.traveldate as string) ||
                  (b.created_at as string);
                const price =
                  booking.sellingPrice ||
                  (b.sellingprice as string) ||
                  booking.buyingPrice ||
                  (b.buyingPrice as string) ||
                  "$0.00";

                return (
                  <div
                    key={booking.id || index}
                    className={`bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow ${status === "Cancelled" ? "opacity-75" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900">
                            {origin} → {destination}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              status === "Confirmed"
                                ? "bg-green-100 text-green-700"
                                : status === "Cancelled"
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Ref: #{pnr} •{" "}
                          {travelDate
                            ? new Date(travelDate).toLocaleDateString()
                            : "Date TBA"}
                        </p>
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          status === "Cancelled"
                            ? "text-slate-500 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {price}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        className="text-xs font-bold text-slate-600 hover:text-primary px-3 py-1.5 rounded hover:bg-slate-50"
                        onClick={() =>
                          router.push(`/dashboard/booking/${booking.id}`)
                        }
                      >
                        View Details
                      </button>
                      {status !== "Cancelled" && booking.id && (
                        <button
                          onClick={() =>
                            router.push(`/dashboard/booking/edit/${booking.id}`)
                          }
                          className="text-xs font-bold text-primary border border-primary/20 px-3 py-1.5 rounded hover:bg-primary/5"
                        >
                          Modify
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      case "payment-due":
        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-4 font-medium text-primary">
                      #BK-7829-XJ
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      Oct 30, 2023
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        Overdue
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">$450.00</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        aria-label="More options"
                        onClick={() =>
                          handleInvoiceAction({
                            id: "#BK-7829-XJ",
                            dueDate: "Oct 30, 2023",
                            amount: "$450.00",
                            status: "Overdue",
                            items: "Flight Ticket (NYC-LON) - Upgrade",
                            customerName: `${customer?.firstName} ${customer?.lastName}`,
                            customerEmail: customer?.email || "",
                          })
                        }
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="px-6 py-4" colSpan={3}>
                      Total Due
                    </td>
                    <td className="px-6 py-4 text-right text-lg">$450.00</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case "linked-travellers":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {linkedTravellersLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-slate-500 text-sm">
                  Loading linked travellers...
                </p>
              </div>
            ) : linkedTravellers.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <span className="material-symbols-outlined text-slate-400">
                    group_off
                  </span>
                </div>
                <h3 className="text-slate-900 font-bold">
                  No linked travellers found
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  No travellers found in this customer&apos;s profile.
                </p>
              </div>
            ) : (
              linkedTravellers.map((traveller, index) => (
                <div
                  key={traveller.id || index}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 uppercase">
                    {traveller.firstName.charAt(0)}
                    {traveller.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 capitalize">
                      {traveller.firstName} {traveller.lastName}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {traveller.passportNumber && (
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Passport:</span>{" "}
                          {traveller.passportNumber}
                        </p>
                      )}
                      {traveller.nationality && (
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">Nationality:</span>{" "}
                          {traveller.nationality}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-0.5">
                        Saved Profile
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-slate-400 hover:text-primary p-2 hover:bg-slate-50 rounded-full transition-colors"
                    title="View Details"
                  >
                    <span className="material-symbols-outlined">
                      visibility
                    </span>
                  </button>
                </div>
              ))
            )}

            <button
              onClick={() => setShowLinkTravellerModal(true)}
              className="col-span-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 hover:border-primary hover:text-primary transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-bold text-sm">
                Link New Traveller (Create Booking)
              </span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 font-display">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error || "Customer not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/customers")}
          className="mt-4 text-primary hover:underline"
        >
          ← Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
      <div className="flex flex-col border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Customer Details
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              ID: {customer.id}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              aria-label="Edit"
              onClick={() => {
                setEditFirstName(customer?.firstName || "");
                setEditLastName(customer?.lastName || "");
                setEditEmail(customer?.email || "");
                setEditPhone(customer?.phone || "");
                setEditDob(customer?.dateOfBirth || "");
                setEditGender(customer?.gender || "");
                setEditCountry(customer?.country || "");
                
                const addr = safeJsonParse<Partial<Address>>(
                  customer?.address,
                  {},
                );
                setEditStreet(addr.street || "");
                setEditState(addr.state || "");
                setEditCity(addr.city || "");
                setEditPostalCode(addr.postalCode || "");
                
                const pCode = customer?.phoneCountryCode || "";
                setEditPhoneCountryCode(pCode);

                // Find ISO based on code and country
                let pIso = "US";
                if (pCode) {
                   const matches = countryPhoneOptions.filter((c) => c.callingCode === pCode);
                   if (matches.length > 0) {
                     const match = matches.find((c) => c.name === customer?.country);
                     pIso = match ? match.iso : matches[0].iso;
                   }
                }
                setEditPhoneIso(pIso);

                setShowEditModal(true);
              }}
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
            </button>
            <button
              aria-label="Close"
              onClick={() => router.push("/dashboard/customers")}
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-5 items-center">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full h-20 w-20 ring-4 ring-slate-50 shadow-sm"
                  style={{
                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${customer.firstName} ${customer.lastName}`,
                    )}&background=random")`,
                  }}
                ></div>
                {customer.isActive === "true" && (
                  <div
                    className="absolute bottom-0 right-0 bg-green-500 h-5 w-5 rounded-full border-2 border-white"
                    title="Active"
                  ></div>
                )}
              </div>
              <div className="flex flex-col">
                <h2 className="text-[#0d131b] text-2xl font-bold leading-tight tracking-tight">
                  {customer.firstName} {customer.lastName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-slate-500 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      mail
                    </span>
                    <span>{customer.email}</span>
                  </div>
                  <span className="hidden sm:block text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <span>
                      {customer.phoneCountryCode} {customer.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:self-center">
              {customer.isActive === "true" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">
                  <span className="material-symbols-outlined text-[14px]">
                    check_circle
                  </span>
                  <span className="text-xs font-semibold">Active</span>
                </div>
              )}
              {customer.isVerified === "true" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  <span className="text-xs font-semibold">Verified</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                <span className="material-symbols-outlined text-[14px]">
                  flight
                </span>
                <span className="text-xs font-semibold">
                  {customer.userType === "USER"
                    ? "customer"
                    : customer.userType || "Traveler"}
                </span>
              </div>
              {customer.socialProvider === "google" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                  <span className="material-symbols-outlined text-[14px]">
                    g_mobiledata
                  </span>
                  <span className="text-xs font-semibold">Google Auth</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                "profile",
                "booking-history",
                "payment-due",
                "linked-travellers",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${
                              activeTab === tab
                                ? "border-primary text-primary"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }
                        `}
                >
                  {tab
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </button>
              ))}
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">{renderTabContent()}</div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-slate-900 text-base font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      settings
                    </span>
                    System Metadata
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      User ID
                    </p>
                    <div className="flex justify-between items-center group cursor-pointer">
                      <p className="text-slate-900 font-mono text-sm">
                        u_{customer.id}
                      </p>
                      <span className="material-symbols-outlined text-slate-400 hover:text-primary text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                        content_copy
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Created At
                    </p>
                    <p className="text-slate-900 text-sm">
                      {customer.created_at ||
                      (customer as unknown as Record<string, string>).createdAt
                        ? new Date(
                            customer.created_at ||
                              (customer as unknown as Record<string, string>)
                                .createdAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Registration Status
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      {customer.auth_user_id ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            how_to_reg
                          </span>
                          Registered
                        </span>
                      ) : (
                        <>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              person_off
                            </span>
                            Not Registered
                          </span>
                          <button
                            onClick={handleInvite}
                            disabled={inviting}
                            className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                          >
                            {inviting ? "Sending..." : "Send Signup Link"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Verification Status
                    </p>
                    <div className="flex items-center gap-2">
                      {String(customer.isVerified) === "true" ||
                      customer.isVerified === true ? (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            verified
                          </span>
                          Verified
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            warning
                          </span>
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Referral Code
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono font-medium">
                        {customer.referralCode || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                      Linked Auth Providers
                    </p>
                    {identities.length > 0 ? (
                      <div className="flex flex-col gap-2 mt-1">
                        {identities.map((identity, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold capitalize flex items-center gap-1 ${
                                  identity.provider === "google"
                                    ? "bg-red-50 text-red-600 border border-red-100"
                                    : identity.provider === "facebook"
                                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                                      : "bg-slate-50 text-slate-600 border border-slate-100"
                                }`}
                              >
                                {identity.provider === "google" && (
                                  <span className="text-[14px]">G</span>
                                )}
                                {identity.provider === "facebook" && (
                                  <span className="text-[14px]">f</span>
                                )}
                                {identity.provider === "email" && (
                                  <span className="material-symbols-outlined text-[14px]">
                                    mail
                                  </span>
                                )}
                                {identity.provider}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(
                                  identity.last_sign_in_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {identity.email && (
                              <p className="text-xs text-slate-500 font-mono ml-1">
                                {identity.email}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-slate-900 text-sm font-medium capitalize">
                            {customer.socialProvider || "Email"}
                          </p>
                        </div>
                        {customer.socialId && (
                          <p className="text-slate-400 text-xs font-mono mt-1 break-all">
                            {customer.socialId}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-500 text-xs font-medium">
                      Account Status
                    </p>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        className="sr-only peer"
                        type="checkbox"
                        checked={customer.isDisabled === "true"}
                        onChange={(e) => {
                          setPendingDisable(e.target.checked);
                          setShowDisableModal(true);
                        }}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                      <span className="ml-2 text-xs font-medium text-slate-900">
                        Disable
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="text-primary text-sm font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    info
                  </span>
                  Admin Note
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                  {creationSourceLabel +
                    (customer.socialProvider ? ` via ${customer.socialProvider}` : "") +
                    (customer.created_at ? ` on ${new Date(customer.created_at).toLocaleDateString()}` : "")}
                </p>
                <button className="text-primary text-xs font-bold hover:underline">
                  View Ticket History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">
                Edit Customer
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Personal & Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Row 1: Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>

                    {/* Row 2: Demographics */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Gender
                      </label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Row 3: Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Phone
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={editPhoneIso}
                      onChange={(e) => {
                        const iso = e.target.value;
                        setEditPhoneIso(iso);
                        const option = countryPhoneOptions.find(
                          (c) => c.iso === iso
                        );
                        if (option) {
                          setEditPhoneCountryCode(option.callingCode);
                        }
                      }}
                      className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    >
                      {countryPhoneOptions.map((option) => (
                        <option key={option.iso} value={option.iso}>
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Address Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Country
                      </label>
                      <select
                        value={editCountry}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditCountry(val);
                          setEditState("");
                          setEditCity("");
                          
                          const selected = countriesData.find(
                            (c) => c.name === val,
                          );
                          if (selected?.code) {
                            try {
                              const cc = getCountryCallingCode(
                                selected.code as CountryCode,
                              );
                              setEditPhoneCountryCode("+" + cc);
                              setEditPhoneIso(selected.code);
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                      >
                        <option value="">Select Country</option>
                        {countriesData.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        State / Province
                      </label>
                      <select
                        value={editState}
                        onChange={(e) => {
                          setEditState(e.target.value);
                          setEditCity("");
                        }}
                        disabled={!editCountry}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Select State</option>
                        {locationsData
                          .find((c) => c.name === editCountry)
                          ?.states.map((state) => (
                            <option key={state.name} value={state.name}>
                              {state.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        City
                      </label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        disabled={!editState}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Select City</option>
                        {locationsData
                          .find((c) => c.name === editCountry)
                          ?.states.find((s) => s.name === editState)
                          ?.cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={editPostalCode}
                        onChange={(e) => setEditPostalCode(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="border-t border-slate-100 p-4 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCustomer}
                className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice/Reminder Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with Reminder Alert */}
            <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 mt-0.5">
                notifications_active
              </span>
              <div>
                <h3 className="text-amber-900 font-bold text-sm">
                  Payment Reminder Required
                </h3>
                <p className="text-amber-700 text-xs mt-1">
                  This invoice is overdue. Please review the details below
                  before sending a reminder to the customer.
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="ml-auto text-amber-900/50 hover:text-amber-900"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Invoice Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                    Invoice Reference
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {selectedInvoice.id}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                    Amount Due
                  </p>
                  <h2 className="text-2xl font-bold text-red-600 mt-1">
                    {selectedInvoice.amount}
                  </h2>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Billed To</p>
                    <p className="text-slate-900 font-bold">
                      {selectedInvoice.customerName}
                    </p>
                    <p className="text-slate-500">
                      {selectedInvoice.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-medium mb-1">Due Date</p>
                    <p className="text-red-600 font-bold">
                      {selectedInvoice.dueDate}
                    </p>
                    <p className="text-slate-500 mt-1">
                      Status:{" "}
                      <span className="font-bold text-slate-900">
                        {selectedInvoice.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-500 font-medium mb-2">Line Items</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-900">
                      {selectedInvoice.items}
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedInvoice.amount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Reminder sent successfully!");
                    setShowInvoiceModal(false);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    send
                  </span>
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link/Create Traveller Modal */}
      {showLinkTravellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  person_add
                </span>
                Link Traveller
              </h3>
              <button
                onClick={() => setShowLinkTravellerModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-200 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                  linkModalTab === "existing"
                    ? "text-primary border-primary bg-blue-50/50"
                    : "text-slate-500 border-transparent hover:bg-slate-50"
                }`}
                onClick={() => setLinkModalTab("existing")}
              >
                Select Existing
              </button>
              <button
                className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                  linkModalTab === "new"
                    ? "text-primary border-primary bg-blue-50/50"
                    : "text-slate-500 border-transparent hover:bg-slate-50"
                }`}
                onClick={() => setLinkModalTab("new")}
              >
                Create New
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {linkModalTab === "existing" ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 mt-0.5">
                      info
                    </span>
                    <div className="text-sm text-blue-900">
                      <p className="font-bold">Search Existing Travellers</p>
                      <p className="mt-1">
                        Search for a traveller profile that already exists in the
                        system to link them to this customer account.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Search Traveller
                    </label>
                    <TravellerSearch
                      onSelect={handleLinkExistingTraveller}
                      className="w-full"
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateNewTraveller} className="space-y-4">
                  {createTravellerError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {createTravellerError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newTravellerData.firstName}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="e.g. John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newTravellerData.lastName}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="e.g. Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={newTravellerData.passportNumber || ""}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            passportNumber: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="e.g. A12345678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Passport Expiry
                      </label>
                      <input
                        type="date"
                        value={newTravellerData.passportExpiry || ""}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            passportExpiry: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={newTravellerData.dob || ""}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            dob: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Nationality
                      </label>
                      <select
                        value={newTravellerData.nationality || ""}
                        onChange={(e) =>
                          setNewTravellerData({
                            ...newTravellerData,
                            nationality: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                      >
                        <option value="">Select Nationality</option>
                        {countriesData.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowLinkTravellerModal(false)}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createTravellerLoading}
                      className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createTravellerLoading ? (
                        <>
                          <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">
                            check
                          </span>
                          Create & Link
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Confirm Account Status</h3>
              <button
                onClick={() => setShowDisableModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">
                {pendingDisable ? "Disable this customer account?" : "Enable this customer account?"}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDisableModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisable}
                className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
