import Link from "next/link";
import { Booking, ManageBooking, Customer } from "@/types";

interface FlightDetailsCardProps {
  booking: Booking;
  record: ManageBooking;
  showFinancials?: boolean;
  showRouteVisuals?: boolean;
  financials?: {
    sellingPrice: number;
    costPrice: number;
    profit: number;
    profitPercent: string;
  };
  title?: string;
  className?: string;
  departureDate?: string;
  arrivalDate?: string;
  duration?: string;
  flightStatus?: string;
}

export default function FlightDetailsCard({
  booking,
  record,
  showFinancials = false,
  showRouteVisuals = true,
  financials,
  title = "Flight Details",
  className = "",
  departureDate,
  arrivalDate,
  duration = "--",
  flightStatus = "Direct",
}: FlightDetailsCardProps) {
  // Helper to extract IATA code
  const getIataCode = (val: string | undefined) => {
    if (!val) return "";
    const match = val.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : val.substring(0, 3).toUpperCase();
  };

  const travellers = booking.travellers || [];
  // For display, prioritize selected travellers if any, otherwise show all
  const displayTravellers =
    record.selected_travellers && record.selected_travellers.length > 0
      ? travellers.filter((t) =>
          record.selected_travellers?.includes(t.id || "")
        )
      : travellers;

  // Flight segments (mock logic if not available in booking object)
  // Assuming booking has origin/destination as strings or objects
  // If itineraries exist, we could use them, but fallback to booking.origin/destination
  const origin = booking.origin;
  const destination = booking.destination;
  const originCode = getIataCode(origin);
  const destinationCode = getIataCode(destination);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
    >
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">
            airplane_ticket
          </span>
          {title}
        </h3>
        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
          PNR: {booking.PNR || "N/A"}
        </span>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-6">
          {showRouteVisuals && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900">
                    {originCode}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {origin}
                  </span>
                  <span className="text-xs text-slate-500">
                    {departureDate || `${booking.IssueDay} ${booking.issueMonth} ${booking.issueYear}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center flex-1 px-4 min-w-[100px] w-full sm:w-auto">
                <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                  <span className="absolute h-2 w-2 rounded-full bg-slate-300 left-0"></span>
                  <span
                    className="material-symbols-outlined absolute text-slate-400 bg-slate-50 px-1"
                    style={{ fontSize: "16px", transform: "rotate(90deg)" }}
                  >
                    flight
                  </span>
                  <span className="absolute h-2 w-2 rounded-full bg-slate-300 right-0"></span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="flex flex-col text-right">
                  <span className="text-lg font-bold text-slate-900">
                    {destinationCode}
                  </span>
                  <span className="text-xs text-slate-500">
                    {arrivalDate || booking.arrivalDate || "Arrival Date N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                Booking ID
              </div>
              <Link
                href={`/dashboard/manage-booking/view/${record.uid}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                BK-{record.booking_id}
              </Link>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                Ticket No.
              </div>
              <div className="flex flex-col gap-1">
                {displayTravellers.length > 0 ? (
                  displayTravellers.map((t, idx) => (
                    <div
                      key={idx}
                      className="text-sm font-semibold text-slate-900"
                    >
                      {t.eticketNumber || "N/A"}
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-900">
                    N/A
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                Passenger
              </div>
              <div className="flex flex-col gap-2">
                {displayTravellers.length > 0 ? (
                  displayTravellers.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        {t.firstName?.[0]}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {t.title ? `${t.title} ` : ""}
                        {t.firstName} {t.lastName}
                      </div>
                      {t.nationality && (
                        <div className="text-xs text-slate-500 truncate">
                          {t.nationality}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-semibold text-slate-900">
                    N/A
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-100">
                  <div className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-slate-400"
                      style={{ fontSize: "14px" }}
                    >
                      mail
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 truncate">
                    {(booking.customer as Customer)?.email ||
                      booking.email ||
                      "No email"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFinancials && financials && (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Selling Price</span>
              <span className="text-lg font-bold text-slate-900">
                ${financials.sellingPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Cost Price</span>
              <span className="text-lg font-bold text-slate-700">
                ${financials.costPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Profit Margin</span>
              <span
                className={`text-lg font-bold flex items-center gap-1 ${
                  financials.profit >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {financials.profit >= 0 ? "+" : ""}
                ${financials.profit.toFixed(2)}
                <span className="text-xs font-normal text-slate-500">
                  ({financials.profitPercent}%)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
