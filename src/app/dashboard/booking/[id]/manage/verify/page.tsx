"use client";
import { use } from "react";
import { useRouter, useParams } from "next/navigation";
import { FinancialCard } from "@/components/booking-management/FinancialCard";

export default function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const bookingId = id || "BK-8842";

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
        <div>
            <h3 className="font-bold text-green-800">Calculation Verified</h3>
            <p className="text-sm text-green-700 mt-1">
                The refund calculation has been successfully processed based on the selected fees. Verify the details below to complete the transaction.
            </p>
        </div>
      </div>

      {/* Original Booking Details (Simplified Header) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
             <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                <span className="material-symbols-outlined text-slate-500">airplane_ticket</span>
                <h3>Original Booking Details</h3>
             </div>
             <div className="bg-slate-100 px-3 py-1 rounded text-xs font-mono text-slate-600">
                PNR: XJ5K9L
             </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* Transaction Breakdown */}
      <div className="mb-6">
         <div className="flex items-center gap-2 mb-4">
             <span className="material-symbols-outlined text-green-600">receipt_long</span>
             <h3 className="font-bold text-slate-900">Transaction Breakdown</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <FinancialCard label="Selling Price" amount="$980.00" className="bg-white" />
             <FinancialCard label="Cost Price" amount="$850.00" className="bg-white" />
             <FinancialCard label="Original Margin" amount="$130.00" className="bg-green-50 border-green-100" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Itemized Deductions (Read Only) */}
          <div>
              <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-slate-500">list</span>
                  <h3 className="font-bold text-slate-900">Itemized Deductions & Fees</h3>
              </div>
              <div className="space-y-4">
                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="size-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined">flight_takeoff</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900">Airline Penalty</h4>
                              <p className="text-xs text-slate-500">Carrier cancellation fee</p>
                          </div>
                      </div>
                      <span className="font-bold text-red-600">- $50.00</span>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="size-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined">storefront</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900">Agency Fees</h4>
                              <p className="text-xs text-slate-500">Service charge</p>
                          </div>
                      </div>
                      <span className="font-bold text-red-600">- $30.00</span>
                  </div>

                  <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <div className="size-10 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                              <span className="material-symbols-outlined">dns</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-slate-900">Skytrips Fee</h4>
                              <p className="text-xs text-slate-500">Platform handling fee</p>
                          </div>
                      </div>
                      <span className="font-bold text-red-600">- $10.00</span>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined">tune</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Manual Adjustment</h4>
                            </div>
                        </div>
                        <span className="font-bold text-slate-900">$0.00</span>
                      </div>
                      <div className="pl-14">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Adjustment Reason</p>
                          <p className="text-sm text-slate-600 italic">N/A - Standard Refund Policy Applied</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Refund Summary & Action */}
          <div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col justify-between">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Refund Summary</p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">Total Selling Price</span>
                            <span className="text-slate-900 font-bold">$980.00</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <span className="font-medium">Total Deductions</span>
                            <span>- $90.00</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                            <span className="font-medium">Net Adjustment</span>
                            <span>$0.00</span>
                        </div>
                        <div className="h-px bg-slate-100 border-t border-dashed border-slate-200"></div>
                      </div>

                      <div className="mb-8">
                          <p className="font-bold text-slate-900 mb-2">Final Refund Amount</p>
                          <p className="text-5xl font-bold text-green-700 flex items-baseline gap-2">
                            $890.00 <span className="text-lg font-medium text-slate-400">USD</span>
                          </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3 border border-slate-100">
                          <span className="material-symbols-outlined text-slate-400">credit_card</span>
                          <p className="text-sm text-slate-600">Refunding to original payment method (Visa ending 4242).</p>
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                     <button 
                        onClick={() => router.push(`/dashboard/booking/${bookingId}/manage/status`)}
                        className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                     >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Process Transaction
                     </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
