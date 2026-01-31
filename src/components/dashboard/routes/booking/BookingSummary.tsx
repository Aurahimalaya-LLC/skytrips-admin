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

export default function BookingSummary({ offer, netFare, taxes, total, passengers }: BookingSummaryProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-4 font-display">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#0EA5E9] text-[20px]">analytics</span>
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Booking Summary</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Flight Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xl font-black text-slate-900">
              {offer.departure.code} 
              <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span> 
              {offer.arrival.code}
            </div>
            <span className="px-2 py-1 bg-blue-50 text-[#0EA5E9] text-[10px] font-bold uppercase rounded">
              {offer.stops.count === 0 ? "Non-stop" : `${offer.stops.count} Stop`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="material-symbols-outlined text-[16px] text-[#0EA5E9]">flight</span>
            <p className="font-bold text-slate-700">{offer.airline.name} • {offer.flightNumber}</p>
          </div>
          <p className="text-[11px] font-medium text-[#0EA5E9] mt-1 pl-6">{scheduleLabel}</p>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Issue Through Agency */}
        <div>
          <label className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider mb-2 block">
            Issue Through Agency
          </label>
          <div className="relative">
            <select className="w-full h-10 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:border-[#0EA5E9] appearance-none">
              <option>Global Travel Solutions</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
              unfold_more
            </span>
          </div>
        </div>

        {/* Agency Commission */}
        <div className="bg-[#F0FDF9] border border-[#CCFBF1] rounded-lg p-3">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-bold text-[#0F766E] uppercase">Agency Commission</span>
            <div className="text-right">
              <span className="text-lg font-bold text-[#0F766E]">$25.00</span>
              <span className="text-xs font-medium text-[#0F766E] ml-1">(2.5%)</span>
            </div>
          </div>
          <div className="flex justify-between items-end">
             <span className="text-[10px] font-medium text-[#0F766E]">Partner profile<br/>calculation</span>
             <span className="text-[9px] font-bold text-[#0F766E]/60 uppercase">Percentage / Fixed<br/>Rate</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#0EA5E9] uppercase tracking-wider mb-4">Price Breakdown</h4>

          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Net Fare ({passengers?.adults || 1} Adults)</span>
            <span className="font-bold text-slate-900">
              {currency} {netFareValue?.toFixed(2)} 
            </span>
          </div>
          
          {typeof taxesValue === "number" && (
            <div className="flex justify-between text-sm font-medium text-slate-600">
              <span>Taxes & Surcharges</span>
              <span className="font-bold text-slate-900">
                {currency} {taxesValue.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center p-2 bg-[#F0FDF9] rounded text-sm font-medium text-[#0F766E] border border-[#CCFBF1]">
            <div className="flex items-center gap-1">
              <span>Net Payable to Agency</span>
              <span className="material-symbols-outlined text-[14px]">info</span>
            </div>
            <span className="font-bold">
               {currency} {(Number(netFareValue || 0) + Number(taxesValue || 0) - 25).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Admin Fee</span>
            <span className="font-bold text-slate-900">
               {currency} 40.00
            </span>
          </div>

          {/* Adjusted Amount */}
          <div className="space-y-1 pt-2">
            <label className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider">
              Adjusted Amount
            </label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
               <input 
                 type="text" 
                 defaultValue="0.00"
                 className="w-full h-10 pl-6 pr-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#0EA5E9]"
               />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider">
              Adjustment Reason
            </label>
            <input 
              type="text" 
              placeholder="Specify reason for price change..."
              className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-[#0EA5E9] placeholder:text-slate-300"
            />
          </div>

          <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-end">
            <span className="text-base font-bold text-slate-900">Total Price</span>
            <div className="text-right">
              <span className="text-2xl font-black text-[#0EA5E9]">
                {currency} {(Number(totalValue || 0) + 40).toFixed(2)}
              </span>
              <p className="text-[9px] font-bold text-[#0EA5E9] uppercase mt-1">Inclusive of commission & taxes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
