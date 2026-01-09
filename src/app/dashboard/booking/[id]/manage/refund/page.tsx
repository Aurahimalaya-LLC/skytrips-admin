"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FlightHeader } from "@/components/booking-management/FlightHeader";
import { FinancialCard } from "@/components/booking-management/FinancialCard";

export default function FinancialBreakdownPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string || "BK-8842";

  const [financials, setFinancials] = useState({
    airlinePenalty: 50.00,
    agencyFees: 30.00,
    skytripsFee: 10.00,
    manualAdjust: 0.00,
    adjustReason: ""
  });

  const [finalRefund, setFinalRefund] = useState(890.00);
  const sellingPrice = 980.00;

  useEffect(() => {
    // Simple calculation logic
    const deductions = financials.airlinePenalty + financials.agencyFees + financials.skytripsFee;
    const result = sellingPrice - deductions + financials.manualAdjust;
    setFinalRefund(result);
  }, [financials]);

  const handleConfirm = () => {
    router.push(`/dashboard/booking/${bookingId}/manage/verify`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12">
      {/* Flight Info (Simplified Header) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-500">airplane_ticket</span>
            <h3 className="font-bold text-slate-900">Flight Information</h3>
         </div>
         <div className="bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600">
            PNR: XJ5K9L
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-sm">JFK</div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg">New York</h4>
                    <p className="text-xs text-slate-500">10:00 AM - 15 Sep</p>
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center px-4">
                <div className="w-full h-px bg-slate-200 relative mb-1">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 material-symbols-outlined text-slate-300 text-[16px] rotate-90">flight</span>
                    <span className="absolute left-0 -top-1 size-2 rounded-full bg-slate-300"></span>
                    <span className="absolute right-0 -top-1 size-2 rounded-full bg-slate-300"></span>
                </div>
                <p className="text-xs text-slate-400">7h 05m Direct</p>
            </div>

            <div className="flex items-center gap-4 justify-end">
                <div className="text-right">
                    <h4 className="font-bold text-slate-900 text-lg">London</h4>
                    <p className="text-xs text-slate-500">10:05 PM - 15 Sep</p>
                </div>
                <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-500 text-sm">LHR</div>
            </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
                <p className="text-slate-900 font-bold">{bookingId}</p>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket No.</p>
                <p className="text-slate-900 font-bold">176-239482910</p>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Agency</p>
                <div className="flex items-center gap-1 font-bold text-slate-900">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">apartment</span>
                    Skyline Travels
                </div>
             </div>
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passenger</p>
                <div className="flex items-center gap-1 font-bold text-slate-900">
                    <span className="size-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">S</span>
                    Ms. Sarah Jenkins
                </div>
             </div>
         </div>
      </div>

      <div className="mb-6">
         <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-green-600">payments</span>
             <h3 className="font-bold text-slate-900">Financial Breakdown</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <FinancialCard label="Selling Price" amount="$980.00" subtext="Total received from Customer" icon="sell" />
             <FinancialCard label="Cost Price" amount="$850.00" subtext="Agency Buying Cost" icon="shopping_bag" />
             <FinancialCard label="Profit Margin" amount="$130.00" subtext="13.26% Margin" icon="trending_up" trend="up" className="bg-green-50 border-green-100" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Deductions Column */}
         <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-slate-500">remove_circle_outline</span>
                <h3 className="font-bold text-slate-900">Deductions & Fees Breakdown</h3>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <label className="text-xs font-bold text-slate-700 uppercase">Airline Penalty Field</label>
                    <span className="material-symbols-outlined text-slate-300">flight_takeoff</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Cancellation policy fee imposed by the carrier.</p>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-red-500 font-bold">- $</span>
                    <input 
                        type="number" 
                        value={financials.airlinePenalty}
                        onChange={(e) => setFinancials({...financials, airlinePenalty: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-red-600 font-bold focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <label className="text-xs font-bold text-slate-700 uppercase">Agency Fees</label>
                    <span className="material-symbols-outlined text-slate-300">storefront</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Service charge retained by the issuing agency.</p>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-red-500 font-bold">- $</span>
                    <input 
                        type="number" 
                        value={financials.agencyFees}
                        onChange={(e) => setFinancials({...financials, agencyFees: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-red-600 font-bold focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <label className="text-xs font-bold text-slate-700 uppercase">Skytrips Fee</label>
                    <span className="material-symbols-outlined text-slate-300">dns</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Platform processing & handling fee.</p>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-red-500 font-bold">- $</span>
                    <input 
                        type="number" 
                        value={financials.skytripsFee}
                        onChange={(e) => setFinancials({...financials, skytripsFee: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-red-600 font-bold focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                    <label className="text-xs font-bold text-slate-700 uppercase">Adjust Amount</label>
                    <span className="material-symbols-outlined text-slate-300">tune</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">Manual adjustment/extra fee.</p>
                <div className="relative mb-3">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                    <input 
                        type="number" 
                        value={financials.manualAdjust}
                        onChange={(e) => setFinancials({...financials, manualAdjust: parseFloat(e.target.value) || 0})}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>
                <div className="relative">
                    <textarea 
                        placeholder="Explain the reason for manual adjustment (e.g., policy waiver, special discount)..."
                        value={financials.adjustReason}
                        onChange={(e) => setFinancials({...financials, adjustReason: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-20"
                    />
                </div>
            </div>
         </div>

         {/* Final Calculation Column */}
         <div>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
                <h3 className="font-bold text-slate-900 mb-4">Final Price Customer Gets <span className="text-slate-400 font-normal text-sm ml-1">(Refund Amount)</span></h3>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-6">
                    <p className="text-4xl font-bold text-green-700 flex items-center justify-center gap-2">
                        $ {finalRefund.toFixed(2)}
                        <span className="text-sm font-medium text-slate-400 mt-3">USD</span>
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Calculation Breakdown</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">Original Selling Price</span>
                        <span className="text-slate-900 font-bold">${sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2 border-t border-dashed border-slate-200"></div>
                    <div className="flex justify-between text-sm text-red-500">
                        <span>- Airline Penalty</span>
                        <span>${financials.airlinePenalty.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                        <span>- Agency Fee</span>
                        <span>${financials.agencyFees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                        <span>- Skytrips Fee</span>
                        <span>${financials.skytripsFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>+/- Adjustment <span className="material-symbols-outlined text-[14px] text-slate-400 align-middle">info</span></span>
                        <span>${financials.manualAdjust.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <div className="flex justify-between text-base">
                        <span className="text-green-700 font-bold">Total Refund Amount</span>
                        <span className="text-green-700 font-bold">${finalRefund.toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                    <p className="text-xs text-blue-800 leading-relaxed">
                        This amount will be credited back to the customer's original payment method within 5-7 business days after confirmation.
                    </p>
                </div>
             </div>
         </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
          <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
          >
             <span className="material-symbols-outlined">arrow_back</span>
             Back
          </button>
          
          <div className="flex gap-3">
             <button className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Modify
             </button>
             <button 
                onClick={handleConfirm}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all"
             >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Confirm Refund
             </button>
          </div>
      </div>
    </div>
  );
}
