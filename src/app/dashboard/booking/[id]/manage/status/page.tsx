"use client";
import { use } from "react";
import { useParams } from "next/navigation";
import { Timeline, TimelineEvent } from "@/components/booking-management/Timeline";

export default function RequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookingId = id || "BK-8842";

  const timelineEvents: TimelineEvent[] = [
    {
      id: "1",
      status: "Waiting for Agency Response",
      timestamp: "Current Status",
      type: "pending",
      isCurrent: true,
      description: "Refund request has been sent to the partner agency. Awaiting their confirmation on waiver policy."
    },
    {
      id: "2",
      status: "Request Sent to Agency",
      timestamp: "24 Oct, 2023 11:45",
      type: "sent",
      description: "Ref: AGY-REQ-2209. Forwarded via agency portal."
    },
    {
      id: "3",
      status: "Customer Notified",
      timestamp: "24 Oct, 2023 10:45",
      type: "received",
      description: "Receipt of refund request acknowledged via email."
    },
    {
      id: "4",
      status: "Refund Requested",
      timestamp: "24 Oct, 2023 10:30",
      type: "info",
      description: "By Sarah Jenkins (Customer) - Reason: Medical"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Flight Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* Refund Request Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-600">assignment_return</span>
                        <h3 className="font-bold text-slate-900">Refund Request Summary</h3>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                        Waiting Response from Agency
                    </span>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                        <p className="font-bold text-slate-900">Customer Cancellation (Medical)</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Request Date</p>
                        <p className="font-bold text-slate-900">24 Oct, 2023 - 10:30 AM</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requested By</p>
                        <p className="font-bold text-slate-900">Sarah Jenkins</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Handling Agency</p>
                        <p className="font-bold text-slate-900">Global Travels Inc.</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes / Remarks</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-600">
                            Request forwarded to handling agency. Awaiting confirmation regarding cancellation fees and refund eligibility from their side before processing.
                        </div>
                    </div>
                </div>
            </div>

            {/* Flight Information (Compact Card) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500">flight</span>
                    <h3 className="font-bold text-slate-900">Flight Information</h3>
                </div>
                <div className="p-6">
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-xs">JFK</div>
                            <div>
                                <h4 className="font-bold text-slate-900">New York</h4>
                                <p className="text-xs text-slate-500">John F. Kennedy Intl<br/>10:00 AM</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center px-4 min-w-[120px]">
                            <p className="text-xs text-slate-400 mb-1">7h 05m</p>
                            <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                                <span className="material-symbols-outlined text-slate-400 text-[14px] rotate-90 bg-slate-50 px-1">flight</span>
                                <span className="absolute left-0 size-1.5 rounded-full bg-slate-300"></span>
                                <span className="absolute right-0 size-1.5 rounded-full bg-slate-300"></span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Direct</p>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                            <div>
                                <h4 className="font-bold text-slate-900">London</h4>
                                <p className="text-xs text-slate-500">Heathrow Airport<br/>10:05 PM</p>
                            </div>
                            <div className="size-10 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-xs">LHR</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
                            <p className="font-bold text-slate-900">{bookingId}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PNR</p>
                            <p className="font-bold text-slate-900">XJ5K9L</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket No.</p>
                            <p className="font-bold text-slate-900">176-239482910</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issued Date</p>
                            <p className="font-bold text-slate-900">15 Sep, 2023</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2">
                             <span className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">S</span>
                             <span className="font-bold text-slate-900">Ms. Sarah Jenkins</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Buying Price</p>
                            <p className="font-bold text-slate-900">$850.00</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selling Price</p>
                            <p className="font-bold text-blue-500">$980.00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Communication Log & Actions */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-slate-500">history</span>
                    <h3 className="font-bold text-slate-900">Communication Log</h3>
                </div>
                <Timeline events={timelineEvents} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">mail</span>
                            Resend Notification
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">edit_note</span>
                            Add Internal Note
                        </span>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">chevron_right</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-red-600 text-sm font-medium">
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined">close</span>
                            Cancel Request
                        </span>
                        <span className="material-symbols-outlined text-red-400 text-[18px]">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
