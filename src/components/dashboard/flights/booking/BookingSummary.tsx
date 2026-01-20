"use client";

import { FlightOffer } from "@/types/flight-search";

interface BookingSummaryProps {
  offer: FlightOffer;
  passengerCount: number;
}

export default function BookingSummary({ offer, passengerCount }: BookingSummaryProps) {
  // Mock calculations
  const netFare = offer.price * passengerCount;
  const taxes = Math.round(netFare * 0.21);
  const adminFee = 40.00;
  const commission = 25.00;
  const commissionRate = 2.5;
  const netPayable = netFare + taxes - commission;
  const total = netFare + taxes + adminFee;

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
          <p className="text-[10px] text-slate-400 mt-1 pl-6">Oct 24, 2023 • 10:15 - 14:00</p>
        </div>

        {/* Agency Info */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Issue Through Agency</label>
          <div className="relative">
            <select className="w-full h-12 pl-4 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all">
              <option>Global Travel Solutions</option>
              <option>SkyTrips Direct</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">unfold_more</span>
          </div>
        </div>

        {/* Commission Card */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Agency Commission</p>
              <p className="text-xs text-emerald-600/80 leading-tight">Partner profile<br/>calculation</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-emerald-700">${commission.toFixed(2)} <span className="text-sm font-bold text-emerald-600/70">({commissionRate}%)</span></p>
              <p className="text-[10px] font-bold text-emerald-600/60 uppercase mt-1">Percentage / Fixed Rate</p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Price Breakdown</h4>
          
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Net Fare ({passengerCount} Adults)</span>
            <span className="font-bold text-slate-900">${netFare.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Taxes & Surcharges</span>
            <span className="font-bold text-slate-900">${taxes.toFixed(2)}</span>
          </div>

          {/* Net Payable */}
          <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 my-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-700">Net Payable to Agency</span>
              <span className="material-symbols-outlined text-[14px] text-emerald-500 cursor-help">info</span>
            </div>
            <span className="text-sm font-black text-emerald-700">${netPayable.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>Admin Fee</span>
            <span className="font-bold text-slate-900">${adminFee.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-100 my-4 pt-4 flex justify-between items-end">
            <span className="text-base font-bold text-slate-900">Total Price</span>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Inclusive of commission & taxes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
