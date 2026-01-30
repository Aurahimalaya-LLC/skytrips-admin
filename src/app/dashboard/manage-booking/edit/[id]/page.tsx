"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FlightDetailsCard from "@/components/booking-management/FlightDetailsCard";
import ProcessingTab from "@/components/booking-management/tabs/ProcessingTab";
import FlightDetailsTab from "@/components/booking-management/tabs/FlightDetailsTab";
import FinancialSummaryTab from "@/components/booking-management/tabs/FinancialSummaryTab";
import RefundedTab from "@/components/booking-management/tabs/RefundedTab";

type TabType = "request" | "processing" | "financial-summary" | "refunded";

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const initialTab = searchParams.get("tab") as TabType;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ManageBooking | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab && ["request", "processing", "financial-summary", "refunded"].includes(initialTab)
      ? initialTab
      : "processing"
  );

  // Shared State (Lifted)
  const [selectedTravellers, setSelectedTravellers] = useState<string[]>([]);
  const [refundStatus, setRefundStatus] = useState<string>("Processing");
  const [requester, setRequester] = useState<{
    name: string;
    email: string;
    agency?: string;
  } | null>(null);

  const [processingForm, setProcessingForm] = useState({
    reason: "",
    notes: "",
    notifyEmail: true,
    notifySMS: false,
    notificationTemplate: "",
    messageContent: "",
  });

  // Financial State
  const [financials, setFinancials] = useState({
    penalty: "0.00",
    agencyFee: "0.00",
    skytripsFee: "0.00",
    agencyRefundedCP: "0.00",
    adjustment: "0.00",
    adjustmentReason: "",
  });

  useEffect(() => {
    if (booking) {
      const parseHelper = (val: string | number | undefined | null) => {
        if (!val) return 0;
        const str = val.toString().replace(/,/g, "");
        return parseFloat(str) || 0;
      };
      
      const sellingPrice = parseHelper(booking.sellingPrice);
      const costPrice = parseHelper(booking.buyingPrice);
      const profit = sellingPrice - costPrice;
      

    }
  }, [booking]);

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id]);

  useEffect(() => {
    if (record?.financial_breakdown) {
      setFinancials({
        penalty:
          record.financial_breakdown.airline_penalty?.toString() || "0.00",
        agencyFee: record.financial_breakdown.agency_fees?.toString() || "0.00",
        skytripsFee:
          record.financial_breakdown.skytrips_fee?.toString() || "0.00",
        agencyRefundedCP:
          record.financial_breakdown.agency_refunded_cp?.toString() || "0.00",
        adjustment: Math.abs(
          record.financial_breakdown.manual_adjustment || 0,
        ).toString(),
        adjustmentReason: record.financial_breakdown.adjustment_reason || "",
      });
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
      if (data.selected_travellers) {
        setSelectedTravellers(data.selected_travellers);
      }
      if (data.refund_status) {
        setRefundStatus(data.refund_status);
      }
      if (data.reason || data.reason_detail) {
        setProcessingForm((prev) => ({
          ...prev,
          reason: data.reason || "",
          notes: data.reason_detail || "",
        }));
      }

      if (data.booking_details) {
        setBooking(data.booking_details as Booking);
      }

      // Fetch dynamic agency name from bookings table
      let agencyName = (data.booking_details as Booking)?.agency || "Travel World Inc.";
      if (data.booking_id) {
        const { data: realBookingData } = await supabase
          .from("bookings")
          .select("issuedthroughagency")
          .eq("id", data.booking_id)
          .single();
        
        if (realBookingData?.issuedthroughagency) {
          agencyName = realBookingData.issuedthroughagency;
        }
      }

      if (data.user_id) {
        const { data: userData } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", data.user_id)
          .single();

        if (userData) {
          const fullName = [userData.first_name, userData.last_name]
            .filter(Boolean)
            .join(" ");
          setRequester({
            name: fullName || "Unknown",
            email: userData.email || "",
            agency: agencyName,
          });
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching record:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setProcessing(true);

      const { error } = await supabase
        .from("manage_booking")
        .update({
          selected_travellers: selectedTravellers,
          refund_status: refundStatus,
          reason: processingForm.reason,
          reason_detail: processingForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("uid", id);

      if (error) throw error;

      // Navigate to next tab
      setActiveTab("request");
    } catch (err) {
      console.error("Error updating record:", err);
      alert("Failed to update booking. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinancialUpdate = (
    key: keyof typeof financials,
    value: string,
  ) => {
    setFinancials((prev) => ({ ...prev, [key]: value }));
  };

  const handleFinalSave = async () => {
    try {
      setProcessing(true);
      const {
        penaltyVal,
        agencyFeeVal,
        skytripsFeeVal,
        agencyRefundedCPVal,
        adjustmentVal,
        netRefund,
      } = calculations;

      const financial_breakdown = {
        airline_penalty: penaltyVal,
        agency_fees: agencyFeeVal,
        skytrips_fee: skytripsFeeVal,
        agency_refunded_cp: agencyRefundedCPVal,
        manual_adjustment: -adjustmentVal,
        total_refund_amount: netRefund,
        adjustment_reason: financials.adjustmentReason,
      };

      const { error } = await supabase
        .from("manage_booking")
        .update({
          financial_breakdown,
          updated_at: new Date().toISOString(),
          status: "SEND", // Move to Requesting/Send state
        })
        .eq("uid", id);

      if (error) throw error;

      // Refresh record or navigate
      // router.push(`/dashboard/manage-booking/view/${id}`); // Or stay
      alert("Financial details saved successfully!");
      fetchRecord(id);
    } catch (err) {
      console.error("Error saving financial breakdown:", err);
      alert("Failed to save details. Please try again.");
    } finally {
      setProcessing(false);
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

  // Calculations
  const parseCurrency = (val: string | number | undefined | null) => {
    if (!val) return 0;
    const str = val.toString().replace(/,/g, "");
    return parseFloat(str) || 0;
  };

  const sellingPrice = parseCurrency(booking.sellingPrice);
  const costPrice = parseCurrency(booking.buyingPrice);
  const profit = sellingPrice - costPrice;
  const profitMargin =
    costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : "0";

  const penaltyVal = parseFloat(financials.penalty) || 0;
  const agencyFeeVal = parseFloat(financials.agencyFee) || 0;
  const skytripsFeeVal = parseFloat(financials.skytripsFee) || 0;
  const agencyRefundedCPVal = parseFloat(financials.agencyRefundedCP) || 0;
  const adjustmentVal = parseFloat(financials.adjustment) || 0;
  const differenceVal = sellingPrice - agencyRefundedCPVal;

  const netRefund = Math.max(
    0,
    sellingPrice -
      differenceVal -
      penaltyVal -
      agencyFeeVal -
      skytripsFeeVal -
      adjustmentVal,
  );

  const calculations = {
    sellingPrice,
    costPrice,
    profit,
    profitMargin, // String
    profitPercent: profitMargin, // Alias
    penaltyVal,
    agencyFeeVal,
    skytripsFeeVal,
    agencyRefundedCPVal,
    adjustmentVal,
    differenceVal: sellingPrice - netRefund,
    netRefund,
  };

  // Route Visuals Data (Mock/Derived)
  // Replicate logic from FlightDetailsCard/Tab if needed, or pass Booking directly
  // FlightDetailsCard handles parsing if we pass undefined.
  // But let's pass formatted strings if we can.
  // The Card component logic is robust enough to handle raw booking data.

  const getPageTitle = () => {
    switch (activeTab) {
      case "financial-summary":
        return "Flight Financial Summary";
      case "request":
        return "Flight Booking Details";
      case "refunded":
        return "Refund Completed";
      default:
        return "Process Request";
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "financial-summary":
        return `Review detailed breakdown and finalize refund for booking #BK-${record.booking_id}.`;
      case "request":
        return `Detailed view of booking #BK-${record.booking_id} and its history.`;
      case "refunded":
        return `Booking #BK-${record.booking_id} has been fully refunded.`;
      default:
        return "Review details and select passengers for refund/changes.";
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
            <span className="font-medium text-slate-900">
              {record.status === "REFUNDED"
                ? "Refunded"
                : record.status === "SEND"
                  ? "Requesting"
                  : record.refund_status === "Processing"
                    ? "Processing"
                    : "Request"}
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {getPageTitle()}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{getPageSubtitle()}</p>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === "processing" && (
                <button
                  onClick={handleUpdate}
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      Next Step
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              )}
              {activeTab === "request" && (
                <>
                  <button
                    onClick={() => setActiveTab("processing")}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setActiveTab("financial-summary")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
                  >
                    Next Step
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </>
              )}
              {activeTab === "financial-summary" && (
                <>
                  <button
                    onClick={() => setActiveTab("request")}
                    className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-[#f6f7f8]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_back
                    </span>
                    Back
                  </button>
                  <button
                    onClick={handleFinalSave}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#137fec] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#106ac4] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">
                        check
                      </span>
                    )}
                    Confirm & Process
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Unified FlightDetailsCard */}
        <FlightDetailsCard
          booking={booking}
          record={record}
          title="Flight Details"
          showRouteVisuals={true}
          showFinancials={activeTab !== "financial-summary"}
          financials={{
            sellingPrice,
            costPrice,
            profit,
            profitPercent: profitMargin,
          }}
        />

        {/* Progress Steps (Tabs) */}
        <div className="w-full px-4 sm:px-0">
          <div className="relative">
            <div
              className="absolute left-0 top-4 -mt-px w-full h-0.5 bg-slate-200"
              aria-hidden="true"
            ></div>
            <ul className="relative flex w-full justify-between">
              {[
                {
                  id: "01",
                  name: "Processing",
                  status:
                    activeTab === "processing"
                      ? "current"
                      : ["request", "financial-summary", "refunded"].includes(activeTab)
                        ? "complete"
                        : "upcoming",
                  onClick: () => setActiveTab("processing"),
                },
                {
                  id: "02",
                  name: "Request",
                  status:
                    activeTab === "request"
                      ? "current"
                      : ["financial-summary", "refunded"].includes(activeTab)
                        ? "complete"
                        : "upcoming",
                  onClick: () => setActiveTab("request"),
                },
                {
                  id: "03",
                  name: "Requesting",
                  status:
                    activeTab === "financial-summary"
                      ? "current"
                      : ["refunded"].includes(activeTab)
                        ? "complete"
                        : "upcoming",
                  onClick: () => setActiveTab("financial-summary"),
                },
                {
                  id: "04",
                  name: "Refunded",
                  status:
                    activeTab === "refunded" ? "current" : "upcoming",
                  onClick: () => setActiveTab("refunded"),
                },
              ].map((step) => (
                <li
                  key={step.name}
                  className="flex flex-col items-center relative bg-transparent z-10"
                >
                  <button
                    onClick={step.onClick}
                    className="flex flex-col items-center group"
                  >
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                        step.status === "current"
                          ? "border-primary bg-primary text-white group-hover:bg-primary-hover"
                          : "border-slate-300 bg-white text-slate-500 group-hover:border-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {step.status === "complete" ? (
                        <span className="material-symbols-outlined text-[16px]">
                          check
                        </span>
                      ) : (
                        <span className="text-xs font-bold">{step.id}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium transition-colors ${
                        step.status === "current"
                          ? "text-primary group-hover:text-primary-hover"
                          : "text-slate-500 group-hover:text-slate-600"
                      }`}
                    >
                      {step.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

          {/* Tab Content */}
          {activeTab === "processing" && (
            <ProcessingTab
              booking={booking}
              record={record}
              requester={requester}
              processingForm={processingForm}
              setProcessingForm={setProcessingForm}
              onConfirm={handleUpdate}
              onCancel={() => router.back()}
              isProcessing={processing}
            />
          )}

          {activeTab === "request" && (
            <FlightDetailsTab
              booking={booking}
              record={record}
              requester={requester}
              calculations={{
                sellingPrice,
                costPrice,
                profit,
                profitPercent: profitMargin,
              }}
              onNext={() => setActiveTab("financial-summary")}
              onPrevious={() => setActiveTab("processing")}
            />
          )}

          {activeTab === "financial-summary" && (
            <FinancialSummaryTab
              booking={booking}
              record={record}
              financials={financials}
              setFinancials={handleFinancialUpdate}
              calculations={calculations}
              onPrevious={() => setActiveTab("request")}
              onConfirm={handleFinalSave}
              isProcessing={processing}
            />
          )}

          {activeTab === "refunded" && (
            <RefundedTab booking={booking} record={record} />
          )}
      </div>
    </div>
  );
}
