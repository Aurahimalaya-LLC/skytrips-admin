"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import AirlineAutocomplete from "@/components/AirlineAutocomplete";
import CustomerSearch from "@/components/CustomerSearch";
import { Customer } from "@/types";
import countryData from "../../../../../../libs/shared-utils/constants/country.json";
import Link from "next/link";

// Define interface for form data to ensure type safety
interface FormData {
  email: string;
  phone: string;
  address: string;
  travellerFirstName: string;
  travellerLastName: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  dob: string;
  tripType: string;
  travelDate: string;
  origin: string;
  destination: string;
  stopoverLocation: string;
  stopoverArrival: string;
  stopoverDeparture: string;
  airlines: string;
  flightNumber: string;
  flightClass: string;
  addons: {
    meals: boolean;
    wheelchair: boolean;
    pickup: boolean;
    dropoff: boolean;
    luggage: boolean;
  };
  prices: {
    meals: string;
    wheelchair: string;
    pickup: string;
    dropoff: string;
    luggage: string;
  };
  frequentFlyer: string;
  pnr: string;
  agency: string;
  handledBy: string; // New field
  status: string;
  paymentStatus: string;
  paymentMethod: string; // New field
  transactionId: string; // New field
  dateOfPayment: string; // New field
  costPrice: number;
  sellingPrice: number;
  customerType: string;
  contactType: string;
  notes: string; // New field
}

export default function EditBookingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [showStopover, setShowStopover] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [existingTravelerSelected, setExistingTravelerSelected] = useState(false);

  const validateContactForm = () => {
    const errors: { [key: string]: string } = {};
    if (formData.contactType === 'new') {
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      travellerFirstName: prev.travellerFirstName || customer.firstName,
      travellerLastName: prev.travellerLastName || customer.lastName,
    }));
    setFormErrors({});
  };
  
  const handleTravelerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      travellerFirstName: customer.firstName,
      travellerLastName: customer.lastName,
      email: prev.email || customer.email,
      phone: prev.phone || customer.phone,
      address: prev.address || customer.address || "",
    }));
    setExistingTravelerSelected(true);
  };
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    address: "",
    travellerFirstName: "",
    travellerLastName: "",
    passportNumber: "",
    passportExpiry: "",
    nationality: "Nepalese",
    dob: "",
    tripType: "One Way",
    travelDate: "",
    origin: "",
    destination: "",
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
    dateOfPayment: "",
    costPrice: 0,
    sellingPrice: 0,
    customerType: "existing",
    contactType: "existing",
    notes: "",
  });
  const hideContactFields = formData.contactType === 'existing' || formData.customerType === 'existing' || existingTravelerSelected;

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
        setFormData({
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          travellerFirstName: data.travellerFirstName || "",
          travellerLastName: data.travellerLastName || "",
          passportNumber: data.passportNumber || "",
          passportExpiry: data.passportExpiry || "",
          nationality: data.nationality || "Nepalese",
          dob: data.dob || "",
          tripType: data.tripType || "One Way",
          travelDate: data.travelDate || "",
          origin: data.origin || "",
          destination: data.destination || "",
          stopoverLocation: data.stopoverLocation || "",
          stopoverArrival: data.stopoverArrival || "",
          stopoverDeparture: data.stopoverDeparture || "",
          airlines: data.airlines || "",
          flightNumber: data.flightNumber || "",
          flightClass: data.flightClass || "Economy",
          addons: data.addons || {
            meals: false,
            wheelchair: false,
            pickup: false,
            dropoff: false,
            luggage: false,
          },
          prices: data.prices || {
            meals: "0.00",
            wheelchair: "0.00",
            pickup: "0.00",
            dropoff: "0.00",
            luggage: "0.00",
          },
          frequentFlyer: data.frequentFlyer || "",
          pnr: data.PNR || "",
          agency: data.agency || "SkyHigh Agency Ltd.",
          handledBy: data.handledBy || "John Doe",
          status: data.status || "Confirmed",
          paymentStatus: data.paymentStatus || "Pending",
          paymentMethod: data.paymentMethod || "",
          transactionId: data.transactionId || "",
          dateOfPayment: data.dateOfPayment || "",
          costPrice: data.buyingPrice || 0,
          sellingPrice: data.sellingPrice || 0,
          customerType: data.customerType || "existing",
          contactType: data.contactType || "existing",
          notes: data.notes || "",
        });
        if (data.stopoverLocation) setShowStopover(true);
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox for addons
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        if (name.startsWith("addon-")) {
            const addonName = name.replace("addon-", "");
            setFormData(prev => ({
                ...prev,
                addons: {
                    ...prev.addons,
                    [addonName as keyof typeof prev.addons]: checked
                }
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

    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }));
  };

  const calculateAddonsTotal = () => {
    return Object.values(formData.prices || {}).reduce((acc, price) => acc + (parseFloat(price) || 0), 0).toFixed(2);
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
    return ((sellingPrice + addonsTotal) - costPrice).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateContactForm()) {
        const firstErrorField = document.querySelector('.error-field');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    setSaving(true);

    try {
      const updateData = {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        travellerFirstName: formData.travellerFirstName,
        travellerLastName: formData.travellerLastName,
        passportNumber: formData.passportNumber,
        passportExpiry: formData.passportExpiry,
        nationality: formData.nationality,
        dob: formData.dob,
        tripType: formData.tripType,
        travelDate: formData.travelDate,
        origin: formData.origin,
        destination: formData.destination,
        stopoverLocation: formData.stopoverLocation,
        stopoverArrival: formData.stopoverArrival,
        stopoverDeparture: formData.stopoverDeparture,
        airlines: formData.airlines,
        flightNumber: formData.flightNumber,
        flightClass: formData.flightClass,
        addons: formData.addons,
        prices: formData.prices,
        frequentFlyer: formData.frequentFlyer,
        PNR: formData.pnr,
        agency: formData.agency,
        handledBy: formData.handledBy,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        dateOfPayment: formData.dateOfPayment,
        buyingPrice: formData.costPrice,
        sellingPrice: formData.sellingPrice,
        customerType: formData.customerType,
        contactType: formData.contactType,
        notes: formData.notes,
      };

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      router.push("/dashboard/booking");
    } catch (err) {
      console.error("Error updating booking:", err);
      alert("Failed to update booking");
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
          <Link className="hover:text-slate-700 transition-colors" href="/dashboard">Dashboard</Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link className="hover:text-slate-700 transition-colors" href="/dashboard/booking">Bookings</Link>
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
            <p className="mt-2 text-sm text-slate-500 font-medium">Update traveller information and itinerary details.</p>
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
                  <span className="material-symbols-outlined text-slate-400">contact_mail</span>
                  Customer Contact Details
                </h3>
              </div>
              <div className="p-6">
                {/* Contact Type Toggle */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                              type="radio" 
                              name="contact-type" 
                              value="existing"
                              checked={formData.contactType === 'existing'}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, contactType: 'existing' }));
                                setFormErrors({});
                              }}
                              className="peer h-4 w-4 text-primary border-slate-300 focus:ring-primary"
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">Existing Contact</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                              type="radio" 
                              name="contact-type" 
                              value="new"
                              checked={formData.contactType === 'new'}
                              onChange={() => setFormData(prev => ({ ...prev, contactType: 'new' }))}
                              className="peer h-4 w-4 text-primary border-slate-300 focus:ring-primary"
                            />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">New Contact</span>
                    </label>
                </div>

                {/* Search for Existing Contact */}
                {formData.contactType === 'existing' && (
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search Customer</label>
                        <CustomerSearch 
                            onSelect={handleCustomerSelect} 
                            className="w-full"
                        />
                    </div>
                )}

                {!hideContactFields ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.email ? 'error-field' : ''}`}>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">email</span>
                        </div>
                        <input 
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                          }`}
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                          }}
                          placeholder="customer@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Phone Number</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.phone ? 'error-field' : ''}`}>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">phone</span>
                        </div>
                        <input 
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.phone 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                          }`}
                          id="phone" 
                          name="phone" 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                          }}
                          placeholder="+61 XXX XXX XXX"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Address</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.address ? 'error-field' : ''}`}>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="material-symbols-outlined text-slate-400 text-[18px]">home</span>
                        </div>
                        <input 
                          className={`block w-full h-10 rounded-lg border pl-10 focus:ring sm:text-sm font-medium transition-colors ${
                            formErrors.address 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' 
                              : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                          }`}
                          id="address" 
                          name="address" 
                          type="text" 
                          value={formData.address}
                          onChange={(e) => {
                            handleChange(e);
                            if (formErrors.address) setFormErrors(prev => ({ ...prev, address: '' }));
                          }}
                          placeholder="e.g. 123 Main St, City"
                        />
                      </div>
                      {formErrors.address && (
                        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-500">visibility_off</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Contact fields hidden</p>
                      <p className="text-xs text-slate-600">Using existing contact or traveller details. You can switch back to New Contact to edit.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Traveller Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">person</span>
                  Traveller Information
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="customer-type" 
                          value="existing"
                          checked={formData.customerType === 'existing'}
                          onChange={() => setFormData(prev => ({ ...prev, customerType: 'existing' }))}
                          className="text-primary focus:ring-primary border-slate-300"
                        />
                        <span className="text-sm font-bold text-slate-700">Existing Traveller</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="customer-type" 
                          value="new"
                          checked={formData.customerType === 'new'}
                          onChange={() => setFormData(prev => ({ ...prev, customerType: 'new' }))}
                          className="text-primary focus:ring-primary border-slate-300"
                        />
                        <span className="text-sm font-bold text-slate-700">New Traveller</span>
                    </label>
                </div>

                {formData.customerType === 'existing' && (
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Search Traveller</label>
                      <CustomerSearch 
                        onSelect={handleTravelerSelect}
                        className="w-full"
                      />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Traveller Full Name</label>
                    <input 
                        className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3 uppercase" 
                        value={`${formData.travellerFirstName} ${formData.travellerLastName}`}
                        readOnly={false}
                        onChange={(e) => {
                            const parts = e.target.value.split(' ');
                            setFormData(prev => ({
                                ...prev,
                                travellerFirstName: parts[0] || '',
                                travellerLastName: parts.slice(1).join(' ') || ''
                            }));
                        }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Passport Number</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                        </div>
                        <input 
                            className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium" 
                            name="passportNumber" 
                            value={formData.passportNumber}
                            onChange={handleChange}
                            placeholder="e.g. A1234567X"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Passport Expiry Date</label>
                    <input 
                        className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3" 
                        name="passportExpiry" 
                        type="date"
                        value={formData.passportExpiry}
                        onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Nationality</label>
                    <select 
                        className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3" 
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                    >
                        {countryData.countries.map(c => <option key={c.value} value={c.label}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Date of Birth</label>
                    <input 
                        className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3" 
                        name="dob" 
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Route & Trip Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">flight_takeoff</span>
                  Route & Trip Details
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowStopover(!showStopover)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[16px]">{showStopover ? 'remove_circle' : 'add_circle'}</span>
                    {showStopover ? 'Remove Stopover' : 'Add Stopover'}
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Trip Type</label>
                        <select 
                            className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3"
                            name="tripType"
                            value={formData.tripType}
                            onChange={handleChange}
                        >
                            <option value="One Way">One Way</option>
                            <option value="Round Trip">Round Trip</option>
                            <option value="Multi City">Multi City</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Travel Date</label>
                        <input 
                            className="block w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium px-3"
                            name="travelDate"
                            type="date"
                            value={formData.travelDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Origin (From)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">flight_takeoff</span>
                            </div>
                            <input 
                                className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                name="origin"
                                value={formData.origin}
                                onChange={handleChange}
                                placeholder="City or Airport"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Destination (To)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">flight_land</span>
                            </div>
                            <input 
                                className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                placeholder="City or Airport"
                            />
                        </div>
                    </div>

                    {showStopover && (
                        <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                Stopover Segment Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Stopover Location</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">place</span>
                                        </div>
                                        <input 
                                            className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                            name="stopoverLocation"
                                            value={formData.stopoverLocation}
                                            onChange={handleChange}
                                            placeholder="City, Airport Code"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Arrival Date</label>
                                    <input 
                                        className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                        name="stopoverArrival"
                                        type="date"
                                        value={formData.stopoverArrival}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Departure Date</label>
                                    <input 
                                        className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                        name="stopoverDeparture"
                                        type="date"
                                        value={formData.stopoverDeparture}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Flight Details Section */}
                    <div className="md:col-span-2 pt-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">FLIGHT DETAILS</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Airline</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">airlines</span>
                                    </div>
                                    <input 
                                        className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                        name="airlines"
                                        value={formData.airlines}
                                        onChange={handleChange}
                                        placeholder="Select Airline"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Flight No.</label>
                                <input 
                                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                    name="flightNumber"
                                    value={formData.flightNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. SQ218"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Class</label>
                                <select 
                                    className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                    name="flightClass"
                                    value={formData.flightClass}
                                    onChange={handleChange}
                                >
                                    <option value="Economy">Economy</option>
                                    <option value="Business">Business</option>
                                    <option value="First">First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                            <span className="material-symbols-outlined text-blue-500">info</span>
                            <div>
                                <p className="text-sm font-bold text-blue-900">Itinerary Modification</p>
                                <p className="text-xs text-blue-700">Changing origin, destination, or dates may affect pricing. Ensure to re-calculate fares after modifying the itinerary.</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Add-ons & Services */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">extension</span>
                  Add-ons & Services
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ancillary Services */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ANCILLARY SERVICES</label>
                        <div className="space-y-4">
                            {/* Meals */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        name="addon-meals"
                                        checked={formData.addons.meals}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Meals</span>
                                    <button type="button" className="text-xs text-blue-600 font-bold flex items-center" onClick={() => setIsMealModalOpen(true)}>
                                        <span className="material-symbols-outlined text-[16px] mr-1">tune</span>
                                        Select Options
                                    </button>
                                </div>
                                <div className="relative w-28">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs">$</span>
                                    </div>
                                    <input 
                                        type="number"
                                        name="price-meals"
                                        value={formData.prices.meals}
                                        onChange={handleChange}
                                        className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10"
                                    />
                                </div>
                            </div>
                            
                            {/* Wheelchair */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        name="addon-wheelchair"
                                        checked={formData.addons.wheelchair}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Request Wheelchair</span>
                                </div>
                                <div className="relative w-28">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs">$</span>
                                    </div>
                                    <input 
                                        type="number"
                                        name="price-wheelchair"
                                        value={formData.prices.wheelchair}
                                        onChange={handleChange}
                                        className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            {/* Airport Pick-up */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        name="addon-pickup"
                                        checked={formData.addons.pickup}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Airport Pick-up</span>
                                </div>
                                <div className="relative w-28">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs">$</span>
                                    </div>
                                    <input 
                                        type="number"
                                        name="price-pickup"
                                        value={formData.prices.pickup}
                                        onChange={handleChange}
                                        className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            {/* Airport Drop-off */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        name="addon-dropoff"
                                        checked={formData.addons.dropoff}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Airport Drop-off</span>
                                </div>
                                <div className="relative w-28">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs">$</span>
                                    </div>
                                    <input 
                                        type="number"
                                        name="price-dropoff"
                                        value={formData.prices.dropoff}
                                        onChange={handleChange}
                                        className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            {/* Extra Luggage */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        name="addon-luggage"
                                        checked={formData.addons.luggage}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Extra Luggage</span>
                                </div>
                                <div className="relative w-28">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-xs">$</span>
                                    </div>
                                    <input 
                                        type="number"
                                        name="price-luggage"
                                        value={formData.prices.luggage}
                                        onChange={handleChange}
                                        className="block w-full h-9 rounded-lg border-slate-200 pl-6 pr-3 text-right text-sm font-medium focus:border-primary focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-900">Add-ons Subtotal</span>
                                <span className="text-lg font-bold text-blue-600">${calculateAddonsTotal()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Flyer & Seat */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Frequent Flyer Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">loyalty</span>
                                </div>
                                <input 
                                    className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                    name="frequentFlyer"
                                    value={formData.frequentFlyer}
                                    onChange={handleChange}
                                    placeholder="e.g. AA-12345678"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Seat Selection</label>
                            <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-slate-400 text-[24px] mb-2">event_seat</span>
                                <span className="text-sm font-bold text-slate-700">Select Seat</span>
                                <span className="text-xs text-slate-500">$25.00</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Special Requests / Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
                  <span className="material-symbols-outlined text-slate-400">note</span>
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
                    <h3 className="text-base font-bold text-slate-900">Booking Details</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID (Read Only)</label>
                        <input className="block w-full h-10 rounded-lg border-slate-200 bg-slate-50 text-slate-500 px-3 sm:text-sm" readOnly value={`#${id}`} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">PNR Reference</label>
                        <input 
                            className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium uppercase"
                            name="pnr"
                            value={formData.pnr}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Issued through Agency</label>
                        <select 
                            className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                            name="agency"
                            value={formData.agency}
                            onChange={handleChange}
                        >
                            <option value="SkyHigh Agency Ltd.">SkyHigh Agency Ltd.</option>
                            <option value="Global Travels Inc.">Global Travels Inc.</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Handled By</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">badge</span>
                            </div>
                            <input 
                                className="block w-full h-10 rounded-lg border-slate-200 pl-10 bg-white text-slate-700 sm:text-sm font-medium" 
                                value={formData.handledBy}
                                readOnly
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Booking Status</label>
                        <select 
                            className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900">Financials</h3>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Currency Used</label>
                        <select className="block w-full h-10 rounded-lg border-slate-200 px-3 bg-white text-slate-700 sm:text-sm font-medium" disabled>
                            <option>USD (United States Dollar)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Payment Status</label>
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
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Payment Method</label>
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
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Transaction ID</label>
                        <input 
                            className="block w-full h-10 rounded-lg border-slate-200 px-3 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="e.g. TXN-12345678"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Date of Payment</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                            </div>
                            <input 
                                className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm font-medium"
                                name="dateOfPayment"
                                type="date"
                                value={formData.dateOfPayment}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Cost Price ($)</label>
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
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Selling Price ($)</label>
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
                            <span className="font-bold text-slate-900">${parseFloat(formData.sellingPrice.toString()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-500">Add-ons Subtotal</span>
                            <span className="font-bold text-slate-900">${calculateAddonsTotal()}</span>
                        </div>
                        <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                            <span className="font-black text-slate-900">Grand Total</span>
                            <span className="font-black text-blue-600">${calculateGrandTotal()}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-700">Estimated Profit</span>
                        <span className="text-sm font-black text-blue-700">${calculateProfit()}</span>
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
                    <span className="material-symbols-outlined text-[20px]">save</span>
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMealModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden ring-1 ring-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Meal Options</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 uppercase tracking-widest">Premium Flight Services</p>
              </div>
              <button onClick={() => setIsMealModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-all p-1 rounded-lg hover:bg-slate-50">
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {[
                { id: 'vml', name: 'Vegetarian Hindu Meal', desc: 'No beef, no pork, prepared with dairy.' },
                { id: 'moors', name: 'Muslim Meal', desc: 'No pork, no alcohol, Halal certified.' },
                { id: 'ksml', name: 'Kosher Meal', desc: 'Prepared under rabbinic supervision.' },
                { id: 'vgml', name: 'Vegan Meal', desc: 'No animal products, no honey or eggs.' },
                { id: 'gfml', name: 'Gluten Free Meal', desc: 'Prepared without wheat, barley or rye.' }
              ].map((meal) => (
                <label key={meal.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-blue-50/30 cursor-pointer transition-all group">
                  <div className="flex items-center h-5 mt-0.5">
                    <input name="meal-selection" type="radio" className="w-4 h-4 text-primary border-slate-300 focus:ring-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{meal.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{meal.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsMealModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">Close</button>
              <button onClick={() => setIsMealModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all">Confirm Selection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
