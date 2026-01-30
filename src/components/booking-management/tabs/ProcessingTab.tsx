import { Booking, ManageBooking } from "@/types";
import { useState } from "react";
import SendEmailModal from "@/components/booking-management/SendEmailModal";

interface ProcessingTabProps {
  booking: Booking;
  record: ManageBooking;
  requester: {
    name: string;
    email: string;
    agency?: string;
  } | null;
  processingForm: {
    reason: string;
    notes: string;
    notifyEmail: boolean;
    notifySMS: boolean;
    notificationTemplate: string;
    messageContent: string;
  };
  setProcessingForm: React.Dispatch<
    React.SetStateAction<{
      reason: string;
      notes: string;
      notifyEmail: boolean;
      notifySMS: boolean;
      notificationTemplate: string;
      messageContent: string;
    }>
  >;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ProcessingTab({
  booking,
  record,
  requester,
  processingForm,
  setProcessingForm,
  onConfirm,
  onCancel,
  isProcessing = false,
}: ProcessingTabProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleChange = (
    field: keyof typeof processingForm,
    value: string | boolean,
  ) => {
    setProcessingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendEmail = async (data: {
    subject: string;
    message: string;
    template: string;
  }) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: requester?.email || booking.email,
          subject: data.subject,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }
      
      // Proceed after successful email
      onConfirm();
    } catch (error) {
      console.error("Error sending refund notification email:", error);
      throw error;
    }
    
    setIsEmailModalOpen(false);
  };

  const handleSkip = () => {
    setIsEmailModalOpen(false);
    onConfirm();
  };

  return (
    <div className="space-y-6">
      {/* Main Processing Form */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Requested by
            </label>
            <input
              type="text"
              readOnly
              value={requester?.name || "Unknown"}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Requested Agency
            </label>
            <input
              type="text"
              readOnly
              value={requester?.agency || "Travel World Inc."}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">
            Reason for Action
          </label>
          <select
            value={processingForm.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select a reason...</option>
            <option value="Customer Request">Customer Request</option>
            <option value="Schedule Change">Schedule Change</option>
            <option value="Duplicate Booking">Duplicate Booking</option>
            <option value="Flight Cancellation">Flight Cancellation</option>
            <option value="Medical Emergency">Medical Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">
            Notes / Remarks
          </label>
          <textarea
            value={processingForm.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            placeholder="Add any additional details about this request..."
          />
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-slate-400">
                mail
              </span>
              <h4 className="text-sm font-semibold text-slate-900">
                Notify Customer
              </h4>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processingForm.notifyEmail}
                  onChange={(e) => handleChange("notifyEmail", e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Send Email Update
                  </div>
                  <div className="text-xs text-slate-500">
                    Notify {requester?.email || "customer"}
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={processingForm.notifySMS}
                  onChange={(e) => handleChange("notifySMS", e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Send SMS Notification
                  </div>
                  <div className="text-xs text-slate-500">
                    Alert to +1 (555) 123-4567
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Custom Notification Messages
            </label>
            <select
              value={processingForm.notificationTemplate}
              onChange={(e) =>
                handleChange("notificationTemplate", e.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select a message template...</option>
              <option value="refund_processed">Refund Processed</option>
              <option value="info_needed">More Information Needed</option>
              <option value="request_rejected">Request Rejected</option>
              <option value="custom">Custom Message</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1.5">
              Message Content
            </label>
            <textarea
              value={processingForm.messageContent}
              onChange={(e) => handleChange("messageContent", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
              placeholder="e.g. Your refund has been processed successfully. Please allow 5-7 business days for the amount to reflect in your account."
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Previous Step
          </button>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
                Next Step
              </>
            )}
          </button>
        </div>
      </div>

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        onSkip={handleSkip}
        skipLabel="Skip & Continue"
        initialTemplateId="refund_in_progress"
        lastEmailSent={booking.last_eticket_sent_at || booking.last_invoice_sent_at}
        lastEmailStatus={
          booking.last_eticket_sent_at || booking.last_invoice_sent_at
            ? "sent"
            : undefined
        }
        recipient={{
          name: requester?.name || booking.travellers?.[0]?.firstName || "Customer",
          email: requester?.email || booking.email || "",
          pnr: booking.PNR,
        }}
        additionalReplacements={{
          "{REASON}": processingForm.reason,
        }}
      />
    </div>
  );
}
