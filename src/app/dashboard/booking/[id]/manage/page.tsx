"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { FlightHeader } from "@/components/booking-management/FlightHeader";

export default function ManagementActionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const bookingId = id || "BK-8842";

  const [formData, setFormData] = useState({
    requestedBy: "Alex Morgan",
    requestedAgency: "Travel World Inc.",
    reason: "",
    notes: "",
    notifyEmail: true,
    notifySMS: false,
    template: "",
    message: ""
  });

  const handleConfirm = () => {
    // Navigate to refund calculation
    router.push(`/dashboard/booking/${bookingId}/manage/refund`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12">
      {/* Flight Details */}
      <FlightHeader 
        bookingId={bookingId}
        pnr="XJ5K9L"
        ticketNo="176-992837123"
        passengerName="Ms. Sarah Jenkins"
        route={{ origin: "JFK", destination: "LHR" }}
        issuedDate="24 Oct, 2023"
        sellingPrice="$1,450.00"
        costPrice="$1,320.00"
        profitMargin={{ amount: "+$130.00", percentage: "9.8%" }}
      />

      {/* Management Action Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500">edit_document</span>
          <h3 className="font-bold text-slate-900">Management Action</h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Requested by</label>
              <input 
                type="text" 
                value={formData.requestedBy}
                readOnly
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Requested Agency</label>
              <input 
                type="text" 
                value={formData.requestedAgency}
                readOnly
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Action</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            >
              <option value="" disabled>Select a reason...</option>
              <option value="medical">Customer Cancellation (Medical)</option>
              <option value="schedule">Schedule Change</option>
              <option value="personal">Personal Reasons</option>
              <option value="visa">Visa Rejection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Notes / Remarks</label>
            <textarea 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-24"
              placeholder="Add any additional details about this request..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>
        
        <div className="border-t border-slate-100 p-6 bg-slate-50/50">
           <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-500">mail</span>
              <h4 className="font-bold text-slate-900">Notify Customer</h4>
           </div>
           
           <div className="flex flex-wrap gap-6 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  checked={formData.notifyEmail}
                  onChange={(e) => setFormData({...formData, notifyEmail: e.target.checked})}
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900">Send Email Update</span>
                  <span className="block text-xs text-slate-500">Notify sarah.j@example.com</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  checked={formData.notifySMS}
                  onChange={(e) => setFormData({...formData, notifySMS: e.target.checked})}
                />
                <div>
                  <span className="block text-sm font-bold text-slate-900">Send SMS Notification</span>
                  <span className="block text-xs text-slate-500">Alert to +1 (555) 123-4567</span>
                </div>
              </label>
           </div>

           <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Custom Notification Messages</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
                  value={formData.template}
                  onChange={(e) => setFormData({...formData, template: e.target.value})}
                >
                  <option value="" disabled>Select a message template...</option>
                  <option value="refund_process">Refund Process Initiated</option>
                  <option value="cancellation_confirm">Cancellation Confirmation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Message Content</label>
                <textarea 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-24"
                  placeholder="e.g. Your refund has been processed successfully. Please allow 5-7 business days for the amount to reflect in your account."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button 
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Confirm Action
        </button>
      </div>
    </div>
  );
}
