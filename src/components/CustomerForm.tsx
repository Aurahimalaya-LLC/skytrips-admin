"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Customer, Booking } from "@/types";
import countriesData from "@/data/countries.json";
import locationsData from "@/data/locations.json";
import { getCountryCallingCode, CountryCode } from "libphonenumber-js";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerToEdit?: Customer | null;
}

export default function CustomerForm({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit,
}: CustomerFormProps) {
  const isEditMode = !!customerToEdit;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneCountryCode: "+1",
    phoneIso: "US",
    dateOfBirth: "",
    gender: "",
    country: "",
    isActive: "true",
    userType: "Traveler",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    passport: {
      number: "",
      expiryDate: "",
      issueCountry: "",
    },
  });

  useEffect(() => {
    if (customerToEdit) {
      const address =
        typeof customerToEdit.address === "string"
          ? JSON.parse(customerToEdit.address)
          : customerToEdit.address || {};

      const passport =
        typeof customerToEdit.passport === "string"
          ? JSON.parse(customerToEdit.passport)
          : customerToEdit.passport || {};

      const pCode = customerToEdit.phoneCountryCode || "+1";
      // Find ISO based on code and country
      let pIso = "US";
      const matches = countryPhoneOptions.filter((c) => c.callingCode === pCode);
      if (matches.length > 0) {
        const match = matches.find((c) => c.name === customerToEdit.country);
        pIso = match ? match.iso : matches[0].iso;
      }

      setFormData({
        firstName: customerToEdit.firstName || "",
        lastName: customerToEdit.lastName || "",
        email: customerToEdit.email || "",
        phone: customerToEdit.phone || "",
        phoneCountryCode: pCode,
        phoneIso: pIso,
        dateOfBirth: customerToEdit.dateOfBirth || "",
        gender: customerToEdit.gender || "",
        country: customerToEdit.country || "",
        isActive:
          customerToEdit.isActive !== undefined
            ? String(customerToEdit.isActive)
            : "true",
        userType: customerToEdit.userType || "Traveler",
        address: {
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country || "",
        },
        passport: {
          number: passport.number || "",
          expiryDate: passport.expiryDate || "",
          issueCountry: passport.issueCountry || "",
        },
      });

      // Fetch bookings for this customer
      const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
          const idStr = String(customerToEdit.id);
          const idNum = Number(customerToEdit.id);
          const conditions = [];

          // 1. Legacy: Check Foreign Key 'customerid'
          conditions.push(`customerid.eq.${idStr}`);
          if (!isNaN(idNum) && idStr.trim() !== "") {
            conditions.push(`customerid.eq.${idNum}`);
          }

          // 2. New: Check JSON field 'id' in 'customer' column
          // JSON.stringify ensures the value is properly quoted for PostgREST
          conditions.push(`customer->>id.eq.${JSON.stringify(idStr)}`);

          const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .or(conditions.join(","))
            .order("created_at", { ascending: false });

          if (error) throw error;
          setBookings(data || []);
        } catch (err) {
          console.error("Error fetching bookings:", err);
        } finally {
          setBookingsLoading(false);
        }
      };

      fetchBookings();
    } else {
      // Reset form for add mode
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        phoneCountryCode: "+1",
        phoneIso: "US",
        dateOfBirth: "",
        gender: "",
        country: "",
        isActive: "true",
        userType: "Traveler",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        passport: { number: "", expiryDate: "", issueCountry: "" },
      });
      setBookings([]);
    }
    setErrors({});
  }, [customerToEdit, isOpen, countryPhoneOptions]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const customerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        phoneCountryCode: formData.phoneCountryCode,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        country: formData.country,
        isActive: formData.isActive,
        userType: formData.userType,
        address: JSON.stringify(formData.address),
        passport: JSON.stringify(formData.passport),
        // Set defaults for required fields
        isDisabled: "false",
        isVerified: "false",
        socialProvider: "",
        socialId: "",
        referralCode: Math.random().toString(36).substring(7).toUpperCase(),
      };

      if (isEditMode && customerToEdit?.id) {
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", customerToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([customerData]);
        if (error) throw error;

        // Log creation and simulate email verification
        console.log(`[System Log] New customer created: ${customerData.email} at ${new Date().toISOString()}`);
        console.log(`[Email Service] Sending verification email to: ${customerData.email}`);
        
        // TODO: Implement actual email sending logic here
        // await sendVerificationEmail(customerData.email);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Error saving customer:", err);
      const message = err instanceof Error ? err.message : "Failed to save customer";
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">
            {isEditMode ? "Edit Customer" : "Create Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errors.submit && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <form
            id="customer-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Personal Info Section */}
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.firstName ? "border-red-300" : "border-slate-200"}`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.lastName ? "border-red-300" : "border-slate-200"}`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Info Section */}
            <section className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  contact_phone
                </span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.email ? "border-red-300" : "border-slate-200"}`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.phoneIso}
                      onChange={(e) => {
                        const iso = e.target.value;
                        const option = countryPhoneOptions.find(
                          (c) => c.iso === iso
                        );
                        setFormData({
                          ...formData,
                          phoneIso: iso,
                          phoneCountryCode: option ? option.callingCode : "+1",
                        });
                      }}
                      className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                    >
                      {countryPhoneOptions.map((option) => (
                        <option key={option.iso} value={option.iso}>
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.phone ? "border-red-300" : "border-slate-200"}`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Address Section */}
            <section className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  home_pin
                </span>
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          street: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="123 Main St"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const selectedCountryName = e.target.value;
                      let newPhoneCode = formData.phoneCountryCode;
                      let newPhoneIso = formData.phoneIso;

                      // Auto-fill phone code
                      const selectedCountry = countriesData.find(
                        (c) => c.name === selectedCountryName
                      );
                      if (selectedCountry?.code) {
                        try {
                          const callingCode = getCountryCallingCode(
                            selectedCountry.code as CountryCode
                          );
                          newPhoneCode = `+${callingCode}`;
                          newPhoneIso = selectedCountry.code;
                        } catch (error) {
                          console.error("Error getting calling code:", error);
                        }
                      }

                      setFormData({
                        ...formData,
                        country: selectedCountryName,
                        phoneCountryCode: newPhoneCode,
                        phoneIso: newPhoneIso,
                        address: {
                          ...formData.address,
                          country: selectedCountryName,
                          state: "",
                          city: "",
                        },
                      });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white ${errors.country ? "border-red-300" : "border-slate-200"}`}
                  >
                    <option value="">Select Country</option>
                    {countriesData.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* State / Province */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State / Province
                  </label>
                  {locationsData.find((c) => c.name === formData.country) ? (
                    <select
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            state: e.target.value,
                            city: "", // Reset city when state changes
                          },
                        })
                      }
                      disabled={!formData.country}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select State</option>
                      {locationsData
                        .find((c) => c.name === formData.country)
                        ?.states.map((state) => (
                          <option key={state.name} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="NY"
                    />
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  {locationsData.find((c) => c.name === formData.country) ? (
                    <select
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      disabled={!formData.address.state}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select City</option>
                      {locationsData
                        .find((c) => c.name === formData.country)
                        ?.states.find((s) => s.name === formData.address.state)
                        ?.cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="New York"
                    />
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          postalCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="10001"
                  />
                </div>
              </div>
            </section>

            {/* Passport & Status Section */}
            <section className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  badge
                </span>
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passport.number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport: {
                          ...formData.passport,
                          number: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                    placeholder="A12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Passport Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.passport.expiryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passport: {
                          ...formData.passport,
                          expiryDate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Bookings Section (Only in Edit Mode) */}
            {isEditMode && (
              <section className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    flight_takeoff
                  </span>
                  Booking History
                </h3>

                {bookingsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            PNR
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {bookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-2 text-sm font-bold text-primary">
                              {booking.PNR}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {booking.origin}{" "}
                              <span className="text-slate-400 mx-1">✈</span>{" "}
                              {booking.destination}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-600">
                              {booking.travelDate ||
                                booking.departureDate ||
                                "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  booking.status?.toLowerCase() === "confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : booking.status?.toLowerCase() ===
                                        "pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {booking.status || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900 text-right font-bold">
                              {booking.sellingPrice
                                ? `$${parseFloat(booking.sellingPrice).toFixed(2)}`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-sm">
                      No bookings found for this customer.
                    </p>
                  </div>
                )}
              </section>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  save
                </span>
                {isEditMode ? "Save Changes" : "Create Customer"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
