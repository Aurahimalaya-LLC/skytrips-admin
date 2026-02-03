"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";

interface BookingHistoryProps {
  customerId?: number | string;
  customerEmail?: string;
}

export default function BookingHistory({
  customerId,
  customerEmail,
}: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      console.log(
        "BookingHistory: fetching for customerId",
        customerId,
        "email",
        customerEmail,
      );
      if (!customerId && !customerEmail) {
        setBookings([]);
        return;
      }

      setLoading(true);
      try {
        // Construct query to handle both legacy (direct ID) and new (JSON object) customer formats
        // We also handle potential type mismatches (string vs number ID)
        const conditions = [];

        if (customerId) {
          const idStr = String(customerId);
          const idNum = Number(customerId);

          // 1. Legacy: Check Foreign Key 'customerid' (Standard relation)
          // We check both string (UUID) and number formats
          conditions.push(`customerid.eq.${idStr}`);
          if (!isNaN(idNum)) {
            conditions.push(`customerid.eq.${idNum}`);
          }

          // 2. New: Check JSON field 'id' in 'customer' column
          // Use ->> to extract field as text (works for json/jsonb)
          conditions.push(`customer->>id.eq.${JSON.stringify(idStr)}`);

          // Remove direct 'customer.eq' check as it causes 400 error on JSONB columns when comparing with string
          // and 'customerid' covers the legacy case anyway.
        }

        if (customerEmail) {
          // 3. Email match (Root column or inside JSON)
          // Use ilike for case-insensitive matching with wildcards to handle whitespace
          const cleanEmail = customerEmail.trim();
          // Add wildcards for loose matching (substring)
          const emailPattern = `*${cleanEmail}*`;
          const emailStr = JSON.stringify(emailPattern);

          // Check root email column
          conditions.push(`email.ilike.${emailStr}`);

          // Check email inside customer JSON: {"email": "..."}
          conditions.push(`customer->>email.ilike.${emailStr}`);
        }

        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .or(conditions.join(","))
          .order("travelDate", { ascending: false })
          .limit(100);

        if (error) throw error;
        console.log("Booking history fetched:", data);
        setBookings(data || []);
      } catch (err: unknown) {
        const sbError = err as { message?: string; details?: string; hint?: string; code?: string };
        console.error("Error fetching booking history:", {
          message: sbError?.message,
          details: sbError?.details,
          hint: sbError?.hint,
          code: sbError?.code,
          fullError: err
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [customerId, customerEmail]);

  if (!customerId && !customerEmail) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <h3 className="text-base font-bold text-slate-900 flex items-center tracking-tight gap-2">
          <span className="material-symbols-outlined text-slate-400">
            history
          </span>
          Customer Booking History
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Recent & Upcoming
        </span>
      </div>
      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <p className="text-slate-500 text-sm font-medium">
              Syncing history...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">
              history_toggle_off
            </span>
            <p className="text-slate-500 text-sm font-medium">
              No previous bookings found for{" "}
              {customerId
                ? `customer #${customerId}`
                : `email ${customerEmail}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Travel Date</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking, index) => (
                  <tr
                    key={booking.id || index}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-900">
                        {booking.travelDate || "TBA"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.tripType}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <span>{booking.origin}</span>
                        <span className="material-symbols-outlined text-[14px] text-slate-400">
                          arrow_forward
                        </span>
                        <span>{booking.destination}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {booking.airlines} • {booking.flightNumber}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          (booking.status === "Confirmed" || booking.status === "ON_HOLD")
                            ? "bg-blue-50 border-blue-100 text-blue-700"
                            : booking.status === "Issued"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : booking.status === "Cancelled"
                            ? "bg-red-50 border-red-100 text-red-700"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}
                      >
                        {(booking.status === "Confirmed" || booking.status === "ON_HOLD")
                          ? "Hold"
                          : booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="font-black text-slate-900">
                        ${booking.sellingPrice || booking.buyingPrice || "0.00"}
                      </div>
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                        {booking.paymentStatus}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
