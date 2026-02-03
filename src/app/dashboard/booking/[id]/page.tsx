"use client";

import { useState, useEffect, use } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Booking, Customer, Traveller } from "@/types";
import {
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
} from "@/lib/booking-helpers";
import { getBookingPayments, BookingPaymentDetails } from "@/lib/services/booking-payments";
import MileageTracker from "@/components/booking-management/MileageTracker";
import BookingStatusProgress from "@/components/booking/BookingStatusProgress";

export default function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const bookingId = id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [payments, setPayments] = useState<BookingPaymentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);

  const formatDateTime = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetails();
    // Fetch logs
    supabase
      .from("booking_logs")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setLogs(data);
      });

    // Set up real-time subscription
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          setBooking(payload.new as Booking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        // --- START MOCK INBOUND ---
        // For visual consistency check if only 1 itinerary exists, add a mock Inbound itinerary
        // matching the design requirement (Qatar Airways BA 115) if it's missing.
        if (data.itineraries && data.itineraries.length === 1) {
             const mockInbound = {
                duration: "19h 45m (1 Stop)",
                segments: [
                  {
                    carrierCode: "QR",
                    number: "115", // BA 115 is likely a codeshare or typo in user image, sticking to QR
                    aircraft: { code: "777" },
                    departure: {
                      iataCode: "DOH",
                      at: "2026-02-05T21:15:00",
                      terminal: "8"
                    },
                    arrival: {
                      iataCode: "LHR", // Assuming LHR based on "BA 115" usually being LHR-JFK, but user image context was DOH->...
                      at: "2026-02-06T16:45:00",
                      terminal: "1"
                    },
                    duration: "PT7H30M" 
                  }
                ]
             };
             // UNCOMMENT THE LINE BELOW TO ENABLE MOCK INBOUND FOR VISUAL TESTING
             // data.itineraries.push(mockInbound);
        }
        // --- END MOCK INBOUND ---

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

  const handleStatusChange = async (newStatus: string) => {
    if (!bookingId || !booking) return;

    // --- Validation Logic ---
    const targetStage = getStatusStage(newStatus);
    const currentStage = getStatusStage(booking.status || "Draft");

    // Only validate if moving forward
    const stages = ["new", "in-progress", "confirmed", "completed"];
    const currentIndex = stages.indexOf(currentStage);
    const targetIndex = stages.indexOf(targetStage);

    if (targetIndex > currentIndex) {
      // Moving to In Progress: Check for basic route info
      if (targetStage === "in-progress" || targetIndex > 1) {
        if (!booking.origin || !booking.destination) {
          alert("Please ensure Route details (Origin/Destination) are set before moving to In Progress.");
          return;
        }
      }

      // Moving to Confirmed: Check for Traveller/Contact info
      if (targetStage === "confirmed" || targetIndex > 2) {
        const hasTravellers = booking.travellers && booking.travellers.length > 0;
        
        let hasContact = !!booking.email;
        if (!hasContact && booking.customer && typeof booking.customer === "object") {
          const customer = booking.customer as Customer;
          hasContact = !!customer.email;
        }
        
        if (!hasTravellers) {
          alert("Please add at least one Traveller before confirming the booking.");
          return;
        }
        if (!hasContact) {
          alert("Please ensure Customer Contact information is complete before confirming.");
          return;
        }
      }

      // Moving to Completed: Check for PNR and Payments
      if (targetStage === "completed") {
        if (!booking.PNR || booking.PNR === "N/A" || booking.PNR.length < 5) {
          alert("A valid PNR Reference is required to mark the booking as Completed.");
          return;
        }
      }
    }
    // --- End Validation ---

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          bookingstatus: newStatus,
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      // Update local state
      setBooking((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusStage = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (["issued", "completed", "finalized"].includes(s)) return "completed";
    if (["confirmed", "hold", "on_hold"].includes(s)) return "confirmed";
    if (["pending", "processing", "send"].includes(s)) return "in-progress";
    return "new";
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) return;

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "Cancelled",
          bookingstatus: "Cancelled",
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;
      setBooking((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
      alert("Booking has been cancelled.");
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking");
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

  const grandTotal = sellingPrice + addonsTotal; 
  const profitMargin = (grandTotal - costPrice).toFixed(2);

  // Helper variables for payment status display
  const displayPaymentStatus = booking.paymentStatus || "Pending";
  const displayPaymentMethod = booking.paymentmethod || "Credit Card";
  const displayTransactionId = booking.transactionId || "TXN-12345678-ABCD-90";
  const displayPaymentDate = booking.dateofpayment || "10 Aug 2021";
  const displayPaymentStatusColor = displayPaymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100";

  return (
    <main className="flex-1 overflow-y-auto m-0 p-0 font-display">
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <nav className="flex text-sm text-slate-500 mb-2">
          <Link href="/dashboard" className="hover:text-slate-700 transition-colors">Dashboard</Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link href="/dashboard/booking" className="hover:text-slate-700 transition-colors">Bookings</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">View Details</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="flex items-center gap-2">
                BK-{booking.id}
                <div className="relative flex items-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`BK-${booking.id}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                    title="Copy Booking ID"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                  {copied && (
                    <span className="absolute left-full ml-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                (booking.status === "Confirmed" || booking.status === "ON_HOLD" || booking.status === "Hold")
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : booking.status === "Issued"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : booking.status === "Cancelled"
                  ? "bg-red-100 text-red-700 border-red-200"
                  : booking.status === "Pending"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                {((booking.status === "Confirmed" || booking.status === "ON_HOLD") ? "Hold" : booking.status) || "Draft"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium italic">
              Detailed view for booking reference BK-{booking.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => router.push(`/dashboard/booking/edit/${bookingId}`)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] mr-1.5">edit</span>
              Modify Booking
            </button>
            <button
              onClick={() => router.push(`/dashboard/booking/${bookingId}/invoice`)}
              className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] mr-1.5 text-slate-500">receipt_long</span>
              Invoice
            </button>
            <button
              onClick={() => router.push(`/dashboard/booking/${bookingId}/eticket`)}
              className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] mr-1.5 text-slate-500">airplane_ticket</span>
              E-Ticket
            </button>
            <button
              onClick={handleCancelBooking}
              className="inline-flex items-center px-3 py-2 bg-white border border-red-100 text-red-600 text-xs font-bold rounded-lg shadow-sm hover:bg-red-50 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] mr-1.5">cancel</span>
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Booking Status Progress Indicator */}
      <div className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Workflow Progress</span>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Tracking Status</h2>
        </div>
        <BookingStatusProgress
          status={booking.status || "Draft"}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
        {/* Left Column: Core Details */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Itinerary Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-[20px]">flight_takeoff</span>
                Flight Itinerary
              </h3>
              <div className="flex gap-2">
                 <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-primary/10 text-primary rounded border border-primary/20">
                    {booking.tripType || "One Way"}
                 </span>
              </div>
            </div>
            <div className="p-6">
              {booking.itineraries && booking.itineraries.length > 0 ? (
                <div className="space-y-10">
                  {booking.itineraries.map((itinerary, itinIndex) => (
                    <div key={itinIndex} className="relative">
                      {/* Sub-header for Inbound/Outbound */}
                      <div className="flex items-center gap-3 mb-6">
                         <div className={`h-8 w-8 rounded-full flex items-center justify-center ${itinIndex === 0 ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                               {itinIndex === 0 ? "flight_takeoff" : "flight_land"}
                            </span>
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                               {itinIndex === 0 ? "Outbound Journey" : "Inbound Journey"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">
                               Duration: {itinerary.duration || "N/A"}
                            </p>
                         </div>
                      </div>

                      <div className="space-y-6">
                        {itinerary.segments.map((segment, segIndex) => {
                          const nextSegment = itinerary.segments[segIndex + 1];
                          let layoverDuration = null;
                          if (nextSegment && segment.arrival?.at && nextSegment.departure?.at) {
                             const arr = new Date(segment.arrival.at);
                             const dep = new Date(nextSegment.departure.at);
                             const diffMs = dep.getTime() - arr.getTime();
                             const diffHrs = Math.floor(diffMs / 3600000);
                             const diffMins = Math.floor((diffMs % 3600000) / 60000);
                             layoverDuration = `${diffHrs}h ${diffMins}m`;
                          }

                          return (
                            <div key={segIndex} className="group">
                              <div className="flex flex-col md:flex-row gap-6 bg-slate-50/30 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/10 transition-all">
                                {/* Carrier Info */}
                                <div className="md:w-48 shrink-0">
                                   <div className="flex items-center gap-3 mb-4">
                                      <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                                         <span className="text-[10px] font-black text-slate-400">{segment.carrierCode}</span>
                                      </div>
                                      <div>
                                         <p className="text-xs font-black text-slate-900">{segment.carrierCode === "QR" ? "Qatar Airways" : `${segment.carrierCode} Airlines`}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{segment.carrierCode}-{segment.number}</p>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                         <span className="material-symbols-outlined text-[14px]">airplane_ticket</span>
                                         {segment.aircraft?.code || "777"} • {booking.flightClass || "Economy"}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                                         <span className="material-symbols-outlined text-[14px]">restaurant</span>
                                         Meals Included
                                      </div>
                                   </div>
                                </div>

                                {/* Timeline & Stops */}
                                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                   <div className="text-right">
                                      <p className="text-xl font-black text-slate-900">
                                         {segment.departure?.at ? new Date(segment.departure.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : "--:--"}
                                      </p>
                                      <p className="text-sm font-black text-slate-800">{segment.departure?.iataCode}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Term {segment.departure?.terminal || "1"}</p>
                                   </div>

                                   <div className="flex flex-col items-center justify-center px-4 min-w-[100px]">
                                      <div className="w-full h-px bg-slate-200 relative">
                                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                            <span className="material-symbols-outlined text-slate-300 text-[18px]">flight</span>
                                         </div>
                                      </div>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Non-Stop</span>
                                   </div>

                                   <div>
                                      <p className="text-xl font-black text-slate-900">
                                         {segment.arrival?.at ? new Date(segment.arrival.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : "--:--"}
                                      </p>
                                      <p className="text-sm font-black text-slate-800">{segment.arrival?.iataCode}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Term {segment.arrival?.terminal || "1"}</p>
                                   </div>
                                </div>
                              </div>

                              {/* Layover Alert */}
                              {layoverDuration && (
                                <div className="mx-6 my-4 py-2 px-4 bg-amber-50 border-l-4 border-amber-400 flex items-center justify-between text-amber-800">
                                   <div className="flex items-center gap-2">
                                      <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                                      <span className="text-[10px] font-black uppercase tracking-wider">Layover in {segment.arrival?.iataCode}</span>
                                   </div>
                                   <span className="text-xs font-black">{layoverDuration}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300 gap-4">
                   <span className="material-symbols-outlined text-6xl opacity-20">flight_takeoff</span>
                   <p className="text-sm font-bold uppercase tracking-widest opacity-50">No detailed itinerary available</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Traveller Details Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                Passenger Information
              </h3>
              <span className="text-[10px] font-black text-slate-400 uppercase">
                 {booking.travellers?.length || 0} Total Passengers
              </span>
            </div>
            <div className="p-6">
               <div className="space-y-4">
                  {booking.travellers && booking.travellers.length > 0 ? (
                     booking.travellers.map((traveller, index) => (
                        <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-6">
                           <div className="h-12 w-12 rounded-full bg-blue-100 text-primary flex items-center justify-center font-black text-lg shrink-0">
                              {traveller.firstName?.[0]}{traveller.lastName?.[0]}
                           </div>
                           <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="col-span-2">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                 <p className="text-sm font-black text-slate-900 uppercase">{traveller.firstName} {traveller.lastName}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Passport</p>
                                 <p className="text-sm font-bold text-slate-700">{traveller.passportNumber || "N/A"}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry</p>
                                 <p className="text-sm font-bold text-slate-700">{traveller.passportExpiry || "N/A"}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">DOB</p>
                                 <p className="text-sm font-bold text-slate-700">{traveller.dob || "N/A"}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nationality</p>
                                 <p className="text-sm font-bold text-slate-700">{traveller.nationality || "N/A"}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">E-Ticket</p>
                                 <p className="text-sm font-black text-primary">{traveller.eticketNumber || "Pending Issuance"}</p>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No traveller data recorded</p>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* 3. Customer & Contact Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-[20px]">contact_mail</span>
                Customer Contact
              </h3>
            </div>
            <div className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                     <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="material-symbols-outlined text-primary">person</span>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Main Contact</p>
                        <p className="text-sm font-black text-slate-900">{getCustomerName(booking) || "N/A"}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">email</span>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                           <p className="text-sm font-bold text-slate-700">{getCustomerEmail(booking) || "N/A"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">phone</span>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                           <p className="text-sm font-bold text-slate-700">{getCustomerPhone(booking) || "N/A"}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 4. Add-ons & Services Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-[20px]">extension</span>
                Ancillary Services
              </h3>
            </div>
            <div className="p-6">
               <div className="space-y-4">
                  {booking.prices && Object.keys(booking.prices).length > 0 ? (
                     Object.entries(booking.prices).map(([name, price], idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/20">
                           <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-white rounded border border-slate-100 shadow-xs">
                                 <span className="material-symbols-outlined text-[16px] text-slate-400">check_circle</span>
                              </div>
                              <span className="text-sm font-bold text-slate-700">{name}</span>
                           </div>
                           <span className="text-sm font-black text-slate-900">${Number(price).toFixed(2)}</span>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-4 text-slate-400 text-xs font-bold uppercase tracking-widest italic opacity-50">
                        No additional services selected
                     </div>
                  )}
                  <div className="pt-4 flex justify-end">
                     <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add-ons Total</span>
                        <span className="text-base font-black text-primary">${addonsTotal.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 5. Special Requests Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary text-[20px]">note</span>
                Special Requests / Notes
              </h3>
            </div>
            <div className="p-6">
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 min-h-[100px]">
                  {booking.notes ? (
                     <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {booking.notes}
                     </p>
                  ) : (
                     <p className="text-sm text-slate-400 italic font-medium">
                        No special requests or internal notes provided for this booking.
                     </p>
                  )}
               </div>
            </div>
          </div>

        </div>

        {/* Right Column: Financials & Admin */}
        <div className="lg:col-span-4 space-y-8 sticky top-6">
          
          {/* Booking Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Booking Status</label>
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center gap-2 ${
                     booking.status === "Issued" ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                     booking.status === "Cancelled" ? "bg-red-50 border-red-100 text-red-700" :
                     "bg-blue-50 border-blue-100 text-blue-700"
                  }`}>
                     <span className="material-symbols-outlined text-3xl">
                        {booking.status === "Issued" ? "verified" : booking.status === "Cancelled" ? "cancel" : "hourglass_top"}
                     </span>
                     <p className="text-lg font-black uppercase tracking-widest">{booking.status || "DRAFT"}</p>
                     <p className="text-[10px] font-bold opacity-70">Last Updated: {formatDateTime(booking.updated_at)}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PNR Reference</span>
                     <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded uppercase">{booking.PNR || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuing Agency</span>
                     <span className="text-xs font-bold text-slate-800">{booking.agency || "SkyTrips"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Handled By</span>
                     <span className="text-xs font-bold text-slate-800">Admin Staff</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created At</span>
                     <span className="text-[10px] font-bold text-slate-500">{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Financials Card */}
          <div className="bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white">
            <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Financial Breakdown</h3>
               <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded uppercase">USD</span>
            </div>
            <div className="p-6 space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>Selling Price</span>
                     <span>${sellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                     <span>Ancillary Total</span>
                     <span>${addonsTotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-700 flex justify-between items-end">
                     <span className="text-xs font-black uppercase tracking-widest text-slate-200">Grand Total</span>
                     <span className="text-3xl font-black text-white">${grandTotal.toFixed(2)}</span>
                  </div>
               </div>

               <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <div>
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-0.5">Estimated Profit</p>
                     <p className="text-xl font-black text-emerald-400">${profitMargin}</p>
                  </div>
                  <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                     <span className="material-symbols-outlined">trending_up</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Status</h3>
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${displayPaymentStatusColor}`}>
                      {displayPaymentStatus}
                   </span>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                         <span className="material-symbols-outlined text-[20px]">credit_card</span>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Method</p>
                         <p className="text-xs font-black text-slate-900">{displayPaymentMethod}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                         <span className="material-symbols-outlined text-[20px]">receipt</span>
                      </div>
                      <div className="min-w-0 flex-1">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Transaction ID</p>
                         <p className="text-xs font-black text-slate-900 truncate" title={displayTransactionId}>{displayTransactionId}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-400">
                         <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment Date</p>
                         <p className="text-xs font-black text-slate-900">{displayPaymentDate}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* AI Mileage Tracker */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
             <MileageTracker itineraries={booking.itineraries} />
          </div>

        </div>
      </div>

      {/* Amadeus Logs Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">
              terminal
            </span>
            Amadeus Activity Logs
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">
                content_paste_off
              </span>
              <p className="text-slate-500 text-sm font-medium">No activity logs found for this booking.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id as string} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {log.status as string}
                    </span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {log.type as string}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(log.created_at as string).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Request Payload</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-auto max-h-60">
                      <pre className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap break-all">
                        {JSON.stringify(log.request_payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      {log.status === 'SUCCESS' ? 'Response Payload' : 'Error Details'}
                    </p>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 overflow-auto max-h-60">
                      <pre className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap break-all">
                        {JSON.stringify(log.response_payload || log.error_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
