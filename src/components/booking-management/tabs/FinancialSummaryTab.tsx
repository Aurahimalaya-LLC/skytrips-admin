import { Booking, ManageBooking } from "@/types";
import { useState } from "react";
import SendEmailModal from "@/components/booking-management/SendEmailModal";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email-templates";

interface FinancialSummaryTabProps {
  booking: Booking;
  record: ManageBooking;
  financials: {
    penalty: string;
    agencyFee: string;
    skytripsFee: string;
    agencyRefundedCP: string;
    adjustment: string;
    adjustmentReason: string;
  };
  setFinancials: (
    key: keyof FinancialSummaryTabProps["financials"],
    value: string,
  ) => void;
  calculations: {
    sellingPrice: number;
    costPrice: number;
    profit: number;
    profitMargin: string;
    penaltyVal: number;
    agencyFeeVal: number;
    skytripsFeeVal: number;
    agencyRefundedCPVal: number;
    adjustmentVal: number;
    differenceVal: number;
    netRefund: number;
  };
  onPrevious: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function FinancialSummaryTab({
  booking,
  record,
  financials,
  setFinancials,
  calculations,
  onPrevious,
  onConfirm,
  isProcessing = false,
}: FinancialSummaryTabProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

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
          to: booking.email,
          subject: data.subject,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  };

  const {
    sellingPrice,
    costPrice,
    profit,
    profitMargin,
    netRefund,
    differenceVal,
  } = calculations;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                calculate
              </span>
              Refund Calculation
            </h3>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="text-xs font-medium text-primary hover:text-primary-hover hover:underline"
            >
              Send Breakdown Email
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Base Amounts */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Selling Price
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatCurrency(sellingPrice)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">
                  Cost Price
                </div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatCurrency(costPrice)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Deductions - Removed */}

              {/* Adjustments */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 border-b pb-2">
                  Adjustments & Refund
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Agency Refunded (CP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={financials.agencyRefundedCP}
                      onChange={(e) =>
                        setFinancials("agencyRefundedCP", e.target.value)
                      }
                      className="pl-9 w-full rounded-lg border border-slate-300 text-sm focus:border-primary focus:ring-primary py-2.5"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Amount refunded to us by the airline/supplier
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Manual Adjustment
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={financials.adjustment}
                      onChange={(e) =>
                        setFinancials("adjustment", e.target.value)
                      }
                      className="pl-9 w-full rounded-lg border border-slate-300 text-sm focus:border-primary focus:ring-primary py-2.5"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Adjustment Reason
                  </label>
                  <input
                    type="text"
                    value={financials.adjustmentReason}
                    onChange={(e) =>
                      setFinancials("adjustmentReason", e.target.value)
                    }
                    className="w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary"
                    placeholder="Reason for adjustment..."
                  />
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600">Difference (Retained)</span>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(differenceVal)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="text-base font-bold text-blue-900">
                  Net Refund Amount
                </span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(netRefund)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">
              info
            </span>
            Profit Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Original Profit</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(profit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Margin</span>
              <span className="text-sm font-medium text-slate-900">
                {profitMargin}%
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 mt-2">
              <p className="text-xs text-slate-400">
                This calculation is based on the original booking amounts and does not include the refund deductions.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">
              mail
            </span>
            Proposal
          </h3>
          <button
            onClick={() => setIsProposalModalOpen(true)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              send
            </span>
            Send Proposal
          </button>
        </div>
      </div>

      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        initialTemplateId="refund_approved"
        recipient={{
          name: booking.travellers?.[0]
            ? `${booking.travellers[0].firstName} ${booking.travellers[0].lastName}`
            : "Customer",
          email: booking.email || "",
          pnr: booking.PNR,
        }}
        additionalReplacements={{
          "{REFUND_AMOUNT}": formatCurrency(netRefund),
        }}
      />

      <SendEmailModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSend={async (data) => {
          try {
            const response = await fetch("/api/send-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: booking.email,
                subject: data.subject,
                message: data.message,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to send email");
            }
          } catch (error) {
            console.error("Error sending proposal:", error);
            throw error;
          }
        }}
        initialTemplateId="refund_proposal"
        templates={[
          ...DEFAULT_EMAIL_TEMPLATES,
          {
            id: "refund_proposal",
            name: "Refund Proposal",
            subject: "Refund Proposal - Booking #{PNR}",
            content:
              "Dear {NAME},\n\nRegarding your booking #{PNR}, we have reviewed your case and would like to propose the following refund option:\n\nProposed Refund Amount: {REFUND_AMOUNT}\n\nPlease let us know if this is acceptable.\n\nBest regards,\nSkyTrips Team",
          },
        ]}
        recipient={{
          name: booking.travellers?.[0]
            ? `${booking.travellers[0].firstName} ${booking.travellers[0].lastName}`
            : "Customer",
          email: booking.email || "",
          pnr: booking.PNR,
        }}
        additionalReplacements={{
          "{REFUND_AMOUNT}": formatCurrency(netRefund),
        }}
      />

      <div className="lg:col-span-3 flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
        >
          Previous Step
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-white bg-[#137fec] hover:bg-[#106ac4] rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isProcessing ? (
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">
              check
            </span>
          )}
          Confirm & Process
        </button>
      </div>
    </div>
  );
}
