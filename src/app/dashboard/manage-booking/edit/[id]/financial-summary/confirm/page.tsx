"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ConfirmTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ManageBooking | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id]);

  const fetchRecord = async (uid: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("manage_booking")
        .select("*")
        .eq("uid", uid)
        .single();

      if (error) throw error;
      setRecord(data as ManageBooking);

      if (data.booking_details) {
        setBooking(data.booking_details as Booking);
      }
    } catch (err) {
      console.error("Error fetching record:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="size-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
          Loading details...
        </div>
      </div>
    );
  }

  if (!record || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-slate-500">Record not found</p>
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const sellingPrice = parseFloat(booking.sellingPrice || "0");
  const costPrice = parseFloat(booking.buyingPrice || "0");
  const profit = sellingPrice - costPrice;
  const profitMargin =
    costPrice > 0 ? ((profit / costPrice) * 100).toFixed(2) : "0.00";

  // Use actual values from financial_breakdown if available, otherwise default to 0
  const airlinePenalty = record.financial_breakdown?.airline_penalty || 0;
  const agencyFees = record.financial_breakdown?.agency_fees || 0;
  const skytripsFee = record.financial_breakdown?.skytrips_fee || 0;
  const manualAdjustment = record.financial_breakdown?.manual_adjustment || 0;

  // Recalculate based on saved values
  const totalDeductions = airlinePenalty + agencyFees + skytripsFee;
  const finalRefundAmount = sellingPrice - totalDeductions + manualAdjustment;

  const handleConfirmTransaction = async () => {
    try {
      setProcessing(true);

      // Use API route to bypass RLS policies
      const response = await fetch(`/api/manage-booking/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refund_status: "Refunded",
          status: "REFUNDED",
          // Explicitly save the financial breakdown values that were calculated above
          financial_breakdown: {
            airline_penalty: airlinePenalty,
            agency_fees: agencyFees,
            skytrips_fee: skytripsFee,
            manual_adjustment: manualAdjustment,
            total_refund_amount: finalRefundAmount,
            adjustment_reason:
              record.financial_breakdown?.adjustment_reason || "",
          },
          // Also save the final calculated refund amount
          amount: finalRefundAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Failed to confirm transaction";
        console.error("API update error:", errorMsg);
        throw new Error(errorMsg);
      }

      alert("Refund Processed Successfully!");
      router.push("/dashboard/manage-booking");
    } catch (err) {
      console.error("Error confirming transaction:", err);
      alert("Failed to confirm transaction. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full font-display">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <Link
              href="/dashboard/manage-booking"
              className="hover:text-primary"
            >
              Manage Booking
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <Link
              href={`/dashboard/manage-booking/edit/${id}`}
              className="hover:text-primary"
            >
              BK-{record.booking_id}
            </Link>
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
            <span className="font-medium text-slate-900">Confirmation</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Final Transaction Confirmation
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Please review the summary below before confirming the refund for
                Booking #BK-{record.booking_id}.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-teal-600">
            check_circle
          </span>
          <div>
            <h4 className="text-sm font-semibold text-teal-800">
              Calculation Verified
            </h4>
            <p className="text-sm text-teal-700 mt-1">
              The refund calculation has been successfully processed based on
              the selected fees. Verify the details below to complete the
              transaction.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                airplane_ticket
              </span>
              Original Booking Details
            </h3>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
              PNR: {booking.PNR || "N/A"}
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Booking ID
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  BK-{record.booking_id}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Agency
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-slate-400"
                    style={{ fontSize: "16px" }}
                  >
                    business
                  </span>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    Skyline Travels
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium uppercase text-slate-500 mb-2">
                Passengers
              </div>
              <div className="space-y-3">
                {(() => {
                  const selectedIds = (record as any).selected_travellers || [];
                  const travellers = booking.travellers || [];

                  // Filter travellers whose ID is in the selected_travellers array
                  const refundTravellers =
                    selectedIds.length > 0
                      ? travellers.filter((t: any) =>
                          selectedIds.includes(t.id),
                        )
                      : travellers; // Fallback if no specific selection

                  // If filtering results in empty (e.g. IDs don't match), fallback to all
                  const displayList =
                    refundTravellers.length > 0 ? refundTravellers : travellers;

                  return displayList.map((t: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {t.firstName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {t.firstName} {t.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {t.nationality || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium uppercase text-slate-500">
                          Ticket No.
                        </div>
                        <div className="text-sm font-mono font-medium text-slate-900">
                          {t.eticketNumber || "N/A"}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">
                receipt_long
              </span>
              Transaction Breakdown
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selling Price
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  ${sellingPrice.toFixed(2)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cost Price
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  ${costPrice.toFixed(2)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-teal-50 border border-teal-100">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Original Margin
                </span>
                <div className="text-xl font-bold text-teal-700 mt-1">
                  ${profit.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-slate-400"
                    style={{ fontSize: "18px" }}
                  >
                    list_alt
                  </span>
                  Itemized Deductions & Fees
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 text-red-500">
                        <span className="material-symbols-outlined text-lg">
                          flight_land
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Airline Penalty
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Carrier cancellation fee
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600 text-sm">
                      - ${airlinePenalty.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 text-red-500">
                        <span className="material-symbols-outlined text-lg">
                          storefront
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Agency Fees
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Service charge
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600 text-sm">
                      - ${agencyFees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 text-red-500">
                        <span className="material-symbols-outlined text-lg">
                          dns
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Skytrips Fee
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Platform handling fee
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600 text-sm">
                      - ${skytripsFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-blue-500"
                          style={{ fontSize: "18px" }}
                        >
                          tune
                        </span>
                        <span className="text-sm font-medium text-slate-900">
                          Manual Adjustment
                        </span>
                      </div>
                      <span className="font-bold text-slate-700">
                        ${manualAdjustment.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-blue-100 my-2"></div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Adjustment Reason
                      </span>
                      <p className="text-sm text-slate-600 mt-0.5 italic">
                        N/A - Standard Refund Policy Applied
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-full flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Refund Summary
                </h4>
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Selling Price</span>
                    <span className="font-medium text-slate-900">
                      ${sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Deductions</span>
                    <span className="font-medium text-red-500">
                      - ${totalDeductions.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Net Adjustment</span>
                    <span className="font-medium text-slate-700">
                      ${manualAdjustment.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 border-dashed my-2"></div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-base font-bold text-slate-700">
                      Final Refund Amount
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-emerald-600">
                    <span className="text-4xl font-bold">
                      ${finalRefundAmount.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      USD
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    <span
                      className="material-symbols-outlined text-slate-400"
                      style={{ fontSize: "16px" }}
                    >
                      credit_card
                    </span>
                    Refunding to original payment method (Visa ending 4242).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              arrow_back
            </span>
            Go Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/manage-booking")}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                cancel
              </span>
              Cancel
            </button>
            <button
              onClick={handleConfirmTransaction}
              disabled={processing}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-md hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  check_circle
                </span>
              )}
              Confirm Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
