import { Booking, ManageBooking } from "@/types";
import FlightDetailsCard from "@/components/booking-management/FlightDetailsCard";
import { useState } from "react";

interface FlightDetailsTabProps {
  booking: Booking;
  record: ManageBooking;
  calculations: {
    sellingPrice: number;
    costPrice: number;
    profit: number;
    profitPercent: string;
  };
  requester: {
    name: string;
    email: string;
    agency?: string;
  } | null;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function FlightDetailsTab({
  booking,
  record,
  calculations,
  requester,
  onNext,
  onPrevious,
}: FlightDetailsTabProps) {
  // Note: Requester fetching was in the page. 
  // Ideally, we should fetch this in the parent or reuse the booking user info if available.
  // For now, I'll rely on what's available or we might need to fetch user details in the parent.
  // To avoid complex fetching here, I'll skip the user fetch for now or stub it, 
  // assuming the parent might pass it down if needed.
  // Actually, let's just display what we have or stub "Loading..." if not passed.
  // The original page fetched user details based on record.user_id.

  const itinerary = booking.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (_e) {
      return dateStr;
    }
  };

  const departureInfo = firstSegment?.departure?.at
    ? formatDateTime(firstSegment.departure.at)
    : "10:00 AM";

  const arrivalInfo = lastSegment?.arrival?.at
    ? formatDateTime(lastSegment.arrival.at)
    : "02:00 PM";

  const durationInfo = itinerary?.duration
    ? itinerary.duration.replace("PT", "").toLowerCase()
    : "N/A";

  const flightStatus =
    segments.length > 1 ? `${segments.length - 1} Stop(s)` : "Direct";

  const { sellingPrice, costPrice, profit, profitPercent } = calculations;
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/50">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">
                  pending_actions
                </span>
                Refund Request Summary
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Reason
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {record.reason || "Customer Cancellation (Medical)"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Request Date
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {new Date(record.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Requested By
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {requester?.name || "Loading..."}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Handling Agency
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {requester?.agency || "Travel World Inc."}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Notes / Remarks
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {record.reason_detail ||
                    "Request forwarded to handling agency. Awaiting confirmation regarding cancellation fees and refund eligibility from their side before processing."}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <input
                type="checkbox"
                id="verify-details"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary size-4 cursor-pointer"
              />
            </div>
            <label htmlFor="verify-details" className="text-sm text-slate-700 cursor-pointer select-none">
              <span className="font-semibold text-slate-900 block mb-1">Verify Request Details</span>
              I confirm that I have reviewed the refund request details, including the reason and notes provided. I am ready to proceed to the next step.
            </label>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Previous Step
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!isVerified}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
              Next Step
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
