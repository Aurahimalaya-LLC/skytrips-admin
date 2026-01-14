"use client";

import { useState, useEffect, use } from "react";
import { useRouter, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";

export default function ETicketPage({
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
        if (error.code === "PGRST116") {
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking && !error) {
    return notFound();
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">
              error
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Error Loading E-Ticket
          </h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const ticketNumber = `TKT-${String(booking.id).padStart(10, "0")}`;
  const issueDate = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const isRoundTrip = booking.tripType === "Round Trip";
  
  // Pricing Breakdown Mock Calculation
  const sellingPrice = Number(booking.sellingPrice) || 0;
  const baseFare = sellingPrice * 0.85;
  const taxes = sellingPrice * 0.10;
  const fees = sellingPrice * 0.05;
  const aircraftType = "Boeing 737-800"; // Mocked
  const supportPhone = "+1 800 123 4567";
  const supportEmail = "support@skyhigh.com";
  const supportHours = "24/7 Support";

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12 print:p-0 print:bg-white font-display">
      {/* Navigation / Actions - Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <nav className="flex text-sm text-slate-500">
          <button
            onClick={() => router.back()}
            className="hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Booking
          </button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">E-Ticket</span>
        </nav>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] mr-2">
              print
            </span>
            Download PDF
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px] mr-2">
              send
            </span>
            Send Ticket
          </button>
        </div>
      </div>

      {/* Ticket Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-black text-2xl">
                S
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {(booking as any).issuedthroughagency ||
                    booking.agency ||
                    "SkyHigh Agency"}
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Electronic Ticket Receipt
                </p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                E-TICKET
              </h2>
              <p className="text-base font-bold text-slate-500">
                PNR: <span className="text-primary">{booking.PNR || "UNKNOWN"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">flight</span>
              Flight Itinerary
            </h3>
            
            <div className="space-y-6">
              {/* Outbound Flight */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded uppercase">
                      Outbound
                    </span>
                    <span className="font-bold text-slate-900">{booking.airlines}</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                      {booking.flightNumber || "SQ218"}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-normal">{aircraftType}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    {booking.flightClass || "Economy"} Class
                  </div>
                </div>
                
                <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 w-full">
                    <div className="text-2xl font-black text-slate-900">{booking.origin}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mt-1">Melbourne Airport (T2)</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">
                      Wed, 11 Aug 2021
                    </div>
                    <div className="text-sm text-slate-400 mt-1">10:30 AM <span className="text-xs bg-slate-100 px-1 rounded ml-1">AEST</span></div>
                  </div>

                  <div className="flex flex-col items-center justify-center px-4 text-slate-300 relative group cursor-help">
                    <div className="border-t-2 border-dashed border-slate-200 w-24 relative top-3"></div>
                    <span className="material-symbols-outlined text-2xl bg-white relative z-10 px-2">
                      flight_takeoff
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                      4h 15m
                    </span>
                    
                    {/* Transit Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                      <div className="font-bold mb-1">Direct Flight</div>
                      <div className="text-slate-400">No transit stops</div>
                    </div>
                  </div>

                  <div className="flex-1 w-full text-right md:text-left">
                    <div className="text-2xl font-black text-slate-900">{booking.destination}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase mt-1">Tribhuvan Intl (T1)</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">
                      Wed, 11 Aug 2021
                    </div>
                    <div className="text-sm text-slate-400 mt-1">02:45 PM <span className="text-xs bg-slate-100 px-1 rounded ml-1">NPT</span></div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-sm">
                  <div className="flex gap-8">
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase mr-2">Baggage Allowance</span>
                      <span className="font-bold text-slate-700">30KG Check-in + 7KG Cabin</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase mr-2">Booking Status</span>
                      <span className="font-bold text-emerald-600">Confirmed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Flight (Mocked if Round Trip) */}
              {isRoundTrip && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded uppercase">
                        Return
                      </span>
                      <span className="font-bold text-slate-900">{booking.airlines}</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                        {booking.flightNumber ? booking.flightNumber.replace(/\d+$/, n => String(Number(n) + 1)) : "SQ219"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-normal">{aircraftType}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {booking.flightClass || "Economy"} Class
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full">
                      <div className="text-2xl font-black text-slate-900">{booking.destination}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase mt-1">Tribhuvan Intl (T1)</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        Wed, 18 Aug 2021
                      </div>
                      <div className="text-sm text-slate-400 mt-1">08:15 PM <span className="text-xs bg-slate-100 px-1 rounded ml-1">NPT</span></div>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 text-slate-300 relative group cursor-help">
                      <div className="border-t-2 border-dashed border-slate-200 w-24 relative top-3"></div>
                      <span className="material-symbols-outlined text-2xl bg-white relative z-10 px-2 transform rotate-180">
                        flight_takeoff
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                        4h 30m
                      </span>

                      {/* Transit Tooltip */}
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-20">
                        <div className="font-bold mb-1">Direct Flight</div>
                        <div className="text-slate-400">No transit stops</div>
                      </div>
                    </div>

                    <div className="flex-1 w-full text-right md:text-left">
                      <div className="text-2xl font-black text-slate-900">{booking.origin}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase mt-1">Melbourne Airport (T2)</div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        Thu, 19 Aug 2021
                      </div>
                      <div className="text-sm text-slate-400 mt-1">12:45 AM <span className="text-xs bg-slate-100 px-1 rounded ml-1">AEST</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 px-6 py-4 border border-slate-200 rounded-xl bg-slate-50/30 flex justify-between items-center text-sm hidden">
               <div className="flex gap-8">
                  <div>
                      <span className="text-slate-400 text-xs font-bold uppercase mr-2">Baggage Allowance</span>
                      <span className="font-bold text-slate-700">30KG Check-in + 7KG Cabin</span>
                  </div>
                  <div>
                      <span className="text-slate-400 text-xs font-bold uppercase mr-2">Booking Status</span>
                      <span className="font-bold text-emerald-600">Confirmed</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">payments</span>
              Pricing Details
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 bg-white">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Base Fare</span>
                    <span className="font-bold text-slate-900">${baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Taxes & Surcharges</span>
                    <span className="font-bold text-slate-900">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Service Fees</span>
                    <span className="font-bold text-slate-900">${fees.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-base">
                    <span className="font-black text-slate-900">Total Paid</span>
                    <span className="font-black text-primary">${sellingPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">group</span>
              Passenger Information
            </h3>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Ticket Number</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Passport</th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                   {booking.travellers && booking.travellers.length > 0 ? (
                    booking.travellers.map((traveller: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {traveller.firstName} {traveller.lastName}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                          {ticketNumber}-{index + 1}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {traveller.passportNumber || "N/A"}
                        </td>
                         <td className="px-6 py-4 text-emerald-600 font-bold">
                          Confirmed
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {booking.travellerFirstName} {booking.travellerLastName}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {ticketNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {booking.passportNumber || "N/A"}
                      </td>
                       <td className="px-6 py-4 text-emerald-600 font-bold">
                        Confirmed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Rules & Policies */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Fare Rules & Policies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Cancellation Policy</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cancellations made 48 hours before departure are eligible for a partial refund subject to airline fees. Cancellations within 24 hours are non-refundable.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Change Policy</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Date changes are permitted up to 24 hours before departure with a change fee of $50 plus any fare difference. Name changes are not allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
             <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Important Information
             </h4>
             <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
                <li>Please arrive at the airport at least 3 hours before departure for international flights.</li>
                <li>Valid passport and visa (if applicable) are required for travel.</li>
                <li>This is an electronic ticket. You can print this out or show it on your mobile device at the check-in counter.</li>
                <li>Baggage allowance is subject to airline regulations. Please check with the airline for more details.</li>
             </ul>
          </div>
          {/* Support Information */}
          <div className="bg-slate-900 rounded-xl p-8 text-white mt-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Customer Support
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">24/7 Support Line</div>
                <a href={`tel:${supportPhone}`} className="text-lg font-bold hover:text-primary transition-colors">
                  {supportPhone}
                </a>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Email Support</div>
                <a href={`mailto:${supportEmail}`} className="text-lg font-bold hover:text-primary transition-colors">
                  {supportEmail}
                </a>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Operating Hours</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  {supportHours}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-[16px] text-red-400">emergency</span>
              For emergency travel assistance within 24 hours of departure, please use the priority line above.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
           <p>© {new Date().getFullYear()} {(booking as any).issuedthroughagency || booking.agency || "SkyHigh Agency"}. All rights reserved.</p>
           <p className="mt-1">Issued Date: {issueDate}</p>
        </div>
      </div>
    </div>
  );
}
