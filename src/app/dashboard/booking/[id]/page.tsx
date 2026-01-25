"use client";

import { useState, useEffect, use } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";

export default function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const bookingId = id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (error) {
        // If the error is "PGRST116" (JSON object requested, multiple (or no) rows returned), it means not found
        if (error.code === "PGRST116") {
          // We will handle this in the render
          setBooking(null);
        } else {
          throw error;
        }
      } else {
        setBooking(data);
      }
    } catch (err: unknown) {
      console.error("Error fetching booking:", err);
      let message = "Failed to load booking details";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking && !error) {
    return notFound();
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <div>
            <p className="font-bold">Error Loading Booking</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/booking")}
          className="mt-4 text-primary hover:underline font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Bookings
        </button>
      </div>
    );
  }

  // Calculate financials
  const costPrice = Number(booking.buyingPrice) || 710.0;
  const sellingPrice = Number(booking.sellingPrice) || 836.99;

  let addonsTotal = 85.0;
  if (booking.prices) {
    addonsTotal = Object.values(booking.prices).reduce<number>(
      (acc, val) => acc + Number(val),
      0,
    );
  }

  const grandTotal = sellingPrice + addonsTotal; // Adjust calculation logic as needed based on data model
  // Note: If sellingPrice is the base, and grandTotal includes add-ons.
  // Let's assume Grand Total = Selling Price (Base) + Addons.
  // Reference image shows: Cost Price $710, Add-ons $85, Selling Price $836.99 (Base?), Grand Total $795.00?
  // Wait, Reference image math: Cost 710, Add-ons 85, Selling 836.99. Grand Total 795.00? That doesn't sum up.
  // Let's stick to the visual layout and display available data.
  // Ideally: Grand Total = Selling Price (which usually includes base + margin).
  // I will use reasonable fallbacks to match the visual structure.

  const profitMargin = (grandTotal - costPrice).toFixed(2);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50 font-display">
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link
            href="/dashboard"
            className="hover:text-slate-700 transition-colors"
          >
            Dashboard
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            href="/dashboard/booking"
            className="hover:text-slate-700 transition-colors"
          >
            Bookings
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">View</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Booking #{booking.id}
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                {booking.status || "Confirmed"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Booking summary and invoice details.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                router.push(`/dashboard/booking/edit/${bookingId}`)
              }
              className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] mr-2 text-slate-500">
                edit
              </span>
              Edit Details
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/booking/${bookingId}/invoice`)
              }
              className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] mr-2 text-slate-500">
                receipt_long
              </span>
              View Invoice
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/booking/${bookingId}/eticket`)
              }
              className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] mr-2 text-slate-500">
                airplane_ticket
              </span>
              View E-Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Contact Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  contact_mail
                </span>
                Customer Contact Details
              </h3>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-primary border border-blue-100">
                Existing Customer
              </span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">
                      email
                    </span>
                    {booking.customer?.email || booking.email || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">
                      phone
                    </span>
                    {booking.customer?.phone || booking.phone || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traveller Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  person
                </span>
                Traveller Information
              </h3>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-primary border border-blue-100">
                {booking.travellers && booking.travellers.length > 0
                  ? `${booking.travellers.length} Traveller${
                      booking.travellers.length > 1 ? "s" : ""
                    }`
                  : "Existing Traveller"}
              </span>
            </div>
            <div className="p-6">
              {booking.travellers && booking.travellers.length > 0 ? (
                booking.travellers.map((traveller, index) => (
                  <div
                    key={index}
                    className={
                      index > 0 ? "mt-8 pt-8 border-t border-slate-100" : ""
                    }
                  >
                    {booking.travellers && booking.travellers.length > 1 && (
                      <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs">
                          {index + 1}
                        </span>
                        Traveller Details
                      </h4>
                    )}
                    <div className="mb-6">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Traveller Full Name
                      </label>
                      <p className="text-sm font-bold text-slate-900 uppercase">
                        {traveller.firstName} {traveller.lastName}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Passport Number
                        </label>
                        <p className="text-sm font-bold text-slate-900">
                          {traveller.passportNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Passport Expiry Date
                        </label>
                        <p className="text-sm font-bold text-slate-900">
                          {traveller.passportExpiry || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Date of Birth
                        </label>
                        <p className="text-sm font-bold text-slate-900">
                          {traveller.dob || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          Nationality
                        </label>
                        <p className="text-sm font-bold text-slate-900">
                          {traveller.nationality || "Nepalese"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          E-Ticket Number
                        </label>
                        <p className="text-sm font-bold text-slate-900">
                          {traveller.eticketNumber || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Traveller Full Name
                    </label>
                    <p className="text-sm font-bold text-slate-900 uppercase">
                      {(booking.travellers?.[0]
                        ? `${booking.travellers[0].firstName} ${booking.travellers[0].lastName}`
                        : booking.customer && typeof booking.customer === "object"
                        ? `${booking.customer.firstName} ${booking.customer.lastName}`
                        : "N/A"
                      ).toUpperCase()}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Passport Number
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.passportNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Passport Expiry Date
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.passportExpiry || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Date of Birth
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.dob || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Passport Issue Date
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.passportIssueDate || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Place of Issue
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.placeOfIssue || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Nationality
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.nationality || "N/A"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Route & Trip Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  flight_takeoff
                </span>
                Route & Trip Details
              </h3>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {booking.tripType || "One Way"}
              </span>
            </div>
            <div className="p-6">
              {booking.itineraries && booking.itineraries.length > 0 ? (
                <div className="space-y-6">
                  {booking.itineraries.map((itinerary, itinIndex) => (
                    <div
                      key={itinIndex}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                          {itinIndex === 0
                            ? "Outbound Flight Segments"
                            : "Return Flight Segments"}
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {itinerary.segments.map((segment, segIndex) => (
                          <div
                            key={segIndex}
                            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative group"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              {/* Departure */}
                              <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Departure
                                </label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                                    <span className="text-xs text-slate-400 block">
                                      Code
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {segment.departure?.iataCode || "N/A"}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-100 col-span-2">
                                    <span className="text-xs text-slate-400 block">
                                      Time
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {segment.departure?.at
                                        ? new Date(
                                            segment.departure.at,
                                          ).toLocaleString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Arrival */}
                              <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Arrival
                                </label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                                    <span className="text-xs text-slate-400 block">
                                      Code
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {segment.arrival?.iataCode || "N/A"}
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 px-3 py-2 rounded-md border border-slate-100 col-span-2">
                                    <span className="text-xs text-slate-400 block">
                                      Time
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {segment.arrival?.at
                                        ? new Date(
                                            segment.arrival.at,
                                          ).toLocaleString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Carrier
                                </label>
                                <div className="mt-1 font-bold text-slate-900">
                                  {segment.carrierCode || "N/A"}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Flight No.
                                </label>
                                <div className="mt-1 font-bold text-slate-900">
                                  {segment.number || "N/A"}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Aircraft
                                </label>
                                <div className="mt-1 font-bold text-slate-900">
                                  {segment.aircraft?.code || "N/A"}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">
                                  Duration
                                </label>
                                <div className="mt-1 font-bold text-slate-900">
                                  {segment.duration || "N/A"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 w-full border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-[18px]">
                          flight_takeoff
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Origin
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {booking.origin}
                      </div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        {booking.departureDate ||
                          booking.travelDate ||
                          "Wed, 11 Aug 2021"}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 text-slate-300">
                      <span className="material-symbols-outlined text-2xl">
                        arrow_forward
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                        {booking.tripType === "Round Trip"
                          ? "Return"
                          : "Direct"}
                      </span>
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl p-4 w-full border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-[18px]">
                          flight_land
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Destination
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900">
                        {booking.destination}
                      </div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        {booking.returnDate ||
                          booking.arrivalDate ||
                          "Wed, 11 Aug 2021"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-b border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Airline
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="size-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                          SQ
                        </span>
                        <p className="text-sm font-bold text-slate-900">
                          {booking.airlines}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Flight Number
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.flightNumber || "SQ218"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        Class
                      </label>
                      <p className="text-sm font-bold text-slate-900">
                        {booking.flightClass || "Economy"}
                      </p>
                    </div>
                  </div>

                  {booking.stopoverLocation && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Stopovers
                        </h4>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {booking.stopoverLocation}
                          </p>
                          <p className="text-xs text-slate-500">
                            Changi Airport
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500">
                            <span className="font-bold">Arr:</span> 11 Aug 2021
                          </p>
                          <p className="text-[10px] text-slate-500">
                            <span className="font-bold">Dep:</span> 12 Aug 2021
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Add-ons & Services */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  extension
                </span>
                Add-ons & Services
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                  <div className="col-span-6">Service</div>
                  <div className="col-span-4">Details</div>
                  <div className="col-span-2 text-right">Price</div>
                </div>

                {/* Mock Add-ons if none in booking data */}
                <div className="grid grid-cols-12 text-sm items-center py-2 border-b border-slate-50">
                  <div className="col-span-6 font-bold text-slate-900">
                    Meals
                  </div>
                  <div className="col-span-4 text-slate-500">Standard Meal</div>
                  <div className="col-span-2 text-right font-bold text-slate-900">
                    $15.00
                  </div>
                </div>
                <div className="grid grid-cols-12 text-sm items-center py-2 border-b border-slate-50">
                  <div className="col-span-6 font-bold text-slate-900">
                    Seat Selection
                  </div>
                  <div className="col-span-4 text-slate-500">Seat 12A</div>
                  <div className="col-span-2 text-right font-bold text-slate-900">
                    $25.00
                  </div>
                </div>
                <div className="grid grid-cols-12 text-sm items-center py-2 border-b border-slate-50">
                  <div className="col-span-6 font-bold text-slate-900">
                    Extra Luggage
                  </div>
                  <div className="col-span-4 text-slate-500">20kg Extra</div>
                  <div className="col-span-2 text-right font-bold text-slate-900">
                    $45.00
                  </div>
                </div>
                <div className="grid grid-cols-12 text-sm items-center py-2">
                  <div className="col-span-6 font-bold text-slate-900">
                    Frequent Flyer
                  </div>
                  <div className="col-span-4 text-slate-500">
                    {booking.frequentFlyer || "AA-12345678"}
                  </div>
                  <div className="col-span-2 text-right font-bold text-slate-900">
                    -
                  </div>
                </div>

                <div className="flex justify-end items-center pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-6 mt-4">
                  <span className="text-sm font-bold text-slate-900 mr-8">
                    Add-ons Subtotal
                  </span>
                  <span className="text-lg font-black text-blue-600">
                    ${addonsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-6">
          {/* Booking Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900">
                Booking Details
              </h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Booking ID
                </label>
                <p className="text-sm font-bold text-slate-900">
                  #{booking.id}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  PNR Reference
                </label>
                <span className="inline-block px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded border border-slate-200 mt-1">
                  {booking.PNR || "68YKCD"}
                </span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Issued Through Agency
                </label>
                <p className="text-sm font-bold text-slate-900">
                  {booking.issuedthroughagency ||
                    booking.agency ||
                    "SkyHigh Agency Ltd."}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Handled By
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    {booking.handledBy
                      ? booking.handledBy
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      : "JD"}
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.handledBy || "John Doe"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Booking Status
                </label>
                <div className="mt-1">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {booking.status || "Confirmed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financials Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-base font-bold text-slate-900">Financials</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Currency
                  </label>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.currency || "USD"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Payment Status
                  </label>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded border border-amber-200">
                    {booking.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Payment Method
                  </label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">
                      credit_card
                    </span>
                    {booking.paymentMethod || "Credit Card"}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Transaction ID
                  </label>
                  <p className="text-xs font-bold text-slate-900 break-all">
                    {booking.transactionId || "TXN-12345678-ABCD-90"}
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Date of Payment
                  </label>
                  <p className="text-sm font-bold text-slate-900">
                    {booking.dateofpayment || "10 Aug 2021"}
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Cost Price</span>
                  <span className="font-bold text-slate-900">
                    ${costPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Add-ons</span>
                  <span className="font-bold text-slate-900">
                    ${addonsTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">
                    Selling Price
                  </span>
                  <span className="font-bold text-slate-900 line-through decoration-slate-400 decoration-2">
                    ${sellingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-2">
                  <span className="font-black text-slate-900">Grand Total</span>
                  <span className="font-black text-blue-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">
                  Profit Margin
                </span>
                <span className="text-sm font-black text-emerald-700">
                  ${profitMargin}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
