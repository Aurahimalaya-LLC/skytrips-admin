"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function FinancialSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ManageBooking | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Financial states
  const [penalty, setPenalty] = useState("50.00");
  const [agencyFee, setAgencyFee] = useState("30.00");
  const [skytripsFee, setSkytripsFee] = useState("10.00");
  const [adjustment, setAdjustment] = useState("0.00");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id]);

  useEffect(() => {
    if (record?.financial_breakdown) {
      setPenalty(
        record.financial_breakdown.airline_penalty?.toString() || "50.00",
      );
      setAgencyFee(
        record.financial_breakdown.agency_fees?.toString() || "30.00",
      );
      setSkytripsFee(
        record.financial_breakdown.skytrips_fee?.toString() || "10.00",
      );
      setAdjustment(
        record.financial_breakdown.manual_adjustment?.toString() || "0.00",
      );
    }
  }, [record]);

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

  // Calculations
  const penaltyVal = parseFloat(penalty) || 0;
  const agencyFeeVal = parseFloat(agencyFee) || 0;
  const skytripsFeeVal = parseFloat(skytripsFee) || 0;
  const adjustmentVal = parseFloat(adjustment) || 0;

  const totalDeductions = penaltyVal + agencyFeeVal + skytripsFeeVal;
  const netRefund = sellingPrice - totalDeductions + adjustmentVal;

  const handleSaveAndProceed = async () => {
    try {
      setSaving(true);
      const financial_breakdown = {
        airline_penalty: penaltyVal,
        agency_fees: agencyFeeVal,
        skytrips_fee: skytripsFeeVal,
        manual_adjustment: adjustmentVal,
        total_refund_amount: netRefund,
        adjustment_reason: adjustmentReason,
      };

      const response = await fetch(`/api/manage-booking/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          financial_breakdown,
          refund_status: "Processing",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update record");
      }

      router.push(
        `/dashboard/manage-booking/edit/${id}/financial-summary/confirm`,
      );
    } catch (err) {
      console.error("Error saving financial breakdown:", err);
      alert("Failed to save details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = (record as any).selected_travellers || [];
  const travellers = booking.travellers || [];
  const refundTravellers =
    selectedIds.length > 0
      ? travellers.filter((t: any) => selectedIds.includes(t.id))
      : travellers;
  const displayList =
    refundTravellers.length > 0 ? refundTravellers : travellers;

  return (
    <div className="max-w-5xl mx-auto w-full font-display">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb & Header */}
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
              Bookings
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
            <span className="font-medium text-slate-900">
              Financial Summary
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                Flight Financial Summary
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review detailed breakdown and finalize refund for booking #BK-
                {record.booking_id}.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-[#f6f7f8]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back
              </button>
              <button
                onClick={handleSaveAndProceed}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#106ac4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#137fec] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
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
        </div>

        {/* Flight Information Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                airplane_ticket
              </span>
              Flight Information
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
              PNR: {booking.PNR || "N/A"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                    <span className="font-bold text-xs">{booking.origin}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-slate-900">
                      {booking.origin}
                    </span>
                    <span className="text-xs text-slate-500">
                      10:00 AM - {booking.IssueDay} {booking.issueMonth}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center flex-1 px-4 min-w-[100px] w-full sm:w-auto">
                  <span className="text-xs text-slate-400 mb-1">Duration</span>
                  <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-full bg-slate-300 left-0"></span>
                    <span
                      className="material-symbols-outlined absolute text-slate-400 bg-slate-50 px-1"
                      style={{ fontSize: "16px", transform: "rotate(90deg)" }}
                    >
                      flight
                    </span>
                    <span className="absolute h-2 w-2 rounded-full bg-slate-300 right-0"></span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Direct</span>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex flex-col text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {booking.destination}
                    </span>
                    <span className="text-xs text-slate-500">
                      10:05 PM - {booking.IssueDay} {booking.issueMonth}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">
                    <span className="font-bold text-xs">
                      {booking.destination}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    Ticket No.
                  </div>
                  <div className="flex flex-col gap-1">
                    {displayList.map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-sm font-semibold text-slate-900"
                      >
                        {t.eticketNumber || "N/A"}
                      </div>
                    ))}
                    {displayList.length === 0 && (
                      <div className="text-sm font-semibold text-slate-900">
                        N/A
                      </div>
                    )}
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
                <div>
                  <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                    Passenger
                  </div>
                  <div className="flex flex-col gap-2">
                    {displayList.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {t.firstName?.[0]}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {t.title ? `${t.title} ` : ""}
                          {t.firstName} {t.lastName}
                        </div>
                      </div>
                    ))}
                    {displayList.length === 0 && (
                      <div className="text-sm font-semibold text-slate-900">
                        N/A
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">
                payments
              </span>
              Financial Breakdown
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span
                    className="material-symbols-outlined text-slate-600"
                    style={{ fontSize: "48px" }}
                  >
                    sell
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Selling Price
                </span>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                  ${sellingPrice.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Total received from Customer
                </div>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span
                    className="material-symbols-outlined text-slate-600"
                    style={{ fontSize: "48px" }}
                  >
                    shopping_bag
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cost Price
                </span>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                  ${costPrice.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Agency Buying Cost
                </div>
              </div>
              <div className="p-5 rounded-xl bg-teal-50 border border-teal-100 relative overflow-hidden group hover:border-teal-200 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span
                    className="material-symbols-outlined text-teal-600"
                    style={{ fontSize: "48px" }}
                  >
                    trending_up
                  </span>
                </div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Profit Margin
                </span>
                <div className="text-2xl md:text-3xl font-bold text-teal-700 mt-2">
                  ${profit.toFixed(2)}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 mt-1">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "14px" }}
                  >
                    arrow_upward
                  </span>
                  {profitMargin}% Margin
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8 pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-slate-400"
                      style={{ fontSize: "18px" }}
                    >
                      remove_circle_outline
                    </span>
                    Deductions & Fees Breakdown
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-lg border border-slate-200 hover:border-red-300 bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase text-slate-700"
                            htmlFor="penalty"
                          >
                            Airline Penalty Field
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Cancellation policy fee imposed by the carrier.
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined text-slate-300"
                          style={{ fontSize: "20px" }}
                        >
                          flight_land
                        </span>
                      </div>
                      <div className="relative rounded-md shadow-sm mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-red-500 font-medium">- $</span>
                        </div>
                        <input
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-bold text-red-600 focus:border-red-500 focus:ring-red-500"
                          id="penalty"
                          name="penalty"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={penalty}
                          onChange={(e) => setPenalty(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:border-red-300 bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase text-slate-700"
                            htmlFor="agency_fee"
                          >
                            Agency Fees
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Service charge retained by the issuing agency.
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined text-slate-300"
                          style={{ fontSize: "20px" }}
                        >
                          storefront
                        </span>
                      </div>
                      <div className="relative rounded-md shadow-sm mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-red-500 font-medium">- $</span>
                        </div>
                        <input
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-bold text-red-600 focus:border-red-500 focus:ring-red-500"
                          id="agency_fee"
                          name="agency_fee"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={agencyFee}
                          onChange={(e) => setAgencyFee(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:border-red-300 bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase text-slate-700"
                            htmlFor="skytrips_fee"
                          >
                            Skytrips Fee
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Platform processing & handling fee.
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined text-slate-300"
                          style={{ fontSize: "20px" }}
                        >
                          dns
                        </span>
                      </div>
                      <div className="relative rounded-md shadow-sm mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-red-500 font-medium">- $</span>
                        </div>
                        <input
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-bold text-red-600 focus:border-red-500 focus:ring-red-500"
                          id="skytrips_fee"
                          name="skytrips_fee"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={skytripsFee}
                          onChange={(e) => setSkytripsFee(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 bg-white transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <label
                            className="block text-xs font-bold uppercase text-slate-700"
                            htmlFor="adjust_amount"
                          >
                            Adjust Amount
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Manual adjustment/extra fee.
                          </p>
                        </div>
                        <span
                          className="material-symbols-outlined text-slate-300"
                          style={{ fontSize: "20px" }}
                        >
                          tune
                        </span>
                      </div>
                      <div className="relative rounded-md shadow-sm mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-slate-500 font-medium">$</span>
                        </div>
                        <input
                          className="block w-full rounded-lg border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm font-bold text-slate-700 focus:border-blue-500 focus:ring-blue-500"
                          id="adjust_amount"
                          name="adjust_amount"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={adjustment}
                          onChange={(e) => setAdjustment(e.target.value)}
                        />
                      </div>
                      <div className="mt-3">
                        <label
                          className="block text-xs font-medium text-slate-500 mb-1.5"
                          htmlFor="adjust_reason"
                        >
                          Adjustment Reason
                        </label>
                        <input
                          className="block w-full rounded-md border-slate-300 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:leading-6"
                          id="adjust_reason"
                          name="adjust_reason"
                          placeholder="Optional reason for adjustment..."
                          type="text"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-full flex flex-col">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full flex flex-col">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6 pb-4 border-b border-slate-200">
                      Final Calculation
                    </h4>

                    <div className="space-y-3 flex-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          Total Ticket Value
                        </span>
                        <span className="font-semibold text-slate-900">
                          ${sellingPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          Less: Airline Penalty
                        </span>
                        <span className="font-medium text-red-600">
                          - ${penaltyVal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          Less: Agency Fees
                        </span>
                        <span className="font-medium text-red-600">
                          - ${agencyFeeVal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          Less: Skytrips Fee
                        </span>
                        <span className="font-medium text-red-600">
                          - ${skytripsFeeVal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Adjustments</span>
                        <span className="font-medium text-slate-900">
                          ${adjustmentVal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t-2 border-slate-200 border-dashed">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase">
                            Net Refund Amount
                          </span>
                          <span className="text-xs text-slate-400">
                            To be returned to customer
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          ${netRefund.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all flex items-center justify-center gap-2">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "20px" }}
                        >
                          check_circle
                        </span>
                        Approve Refund
                      </button>
                      <button
                        onClick={() => router.back()}
                        className="w-full mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
