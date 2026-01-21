"use client";

import { FlightOffer } from "@/types/flight-search";

interface BookingSummaryProps {
  offer: FlightOffer;
  passengerCount?: number;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  netFare?: number;
  taxes?: number;
  total?: number;
}

export default function BookingSummary({ offer, netFare, taxes, total }: BookingSummaryProps) {
  const netFareValue = netFare;
  const taxesValue = taxes;
  const totalValue = total;
  const currency = offer.currency || "USD";
  const departureDate = offer.departure.date || "";
  const arrivalDate = offer.arrival.date || "";
  const departureTime = offer.departure.time || "";
  const arrivalTime = offer.arrival.time || "";

  const hasFullSchedule =
    departureDate !== "" &&
    arrivalDate !== "" &&
    departureTime !== "" &&
    arrivalTime !== "";

  const scheduleLabel = hasFullSchedule
    ? `${departureDate} • ${departureTime} - ${arrivalTime}`
    : "Schedule TBA";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Booking Summary</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* Flight Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xl font-black text-slate-900">
              {offer.departure.code} 
              <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span> 
              {offer.arrival.code}
            </div>
            <span className="px-2 py-1 bg-blue-50 text-primary text-[10px] font-bold uppercase rounded">
              {offer.stops.count === 0 ? "Non-stop" : `${offer.stops.count} Stop`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
               {offer.airline.logo ? (
                  <img src={offer.airline.logo} alt={offer.airline.name} className="w-full h-full object-cover" />
               ) : (
                  <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
               )}
            </div>
            <p>{offer.airline.name} • {offer.flightNumber}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 pl-6">{scheduleLabel}</p>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Price Breakdown</h4>

          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Base Fare</span>
            <span className="font-bold text-slate-900">
              {currency} {netFareValue} 
            </span>
          </div>
          
          {typeof taxesValue === "number" && (
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Taxes & Surcharges</span>
              <span className="font-bold text-slate-900">
                {currency} {taxesValue}
              </span>
            </div>
          )}

          <div className="border-t border-slate-100 my-4 pt-4 flex justify-between items-end">
            <span className="text-base font-bold text-slate-900">Total Price</span>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">
                {currency} {totalValue}
              </span>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Inclusive of taxes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
