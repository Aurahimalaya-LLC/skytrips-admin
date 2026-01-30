"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { getCustomerName } from "@/lib/booking-helpers";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FlightDetailsCard from "@/components/booking-management/FlightDetailsCard";

export default function ManageBookingViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ManageBooking | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [requester, setRequester] = useState<{
    name: string;
    email: string;
    agency?: string;
  } | null>(null);

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

      if (data.user_id) {
        const { data: userData, error: userError } = await supabase
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
            agency: "Travel World Inc.", // Placeholder as per design or fetch if available
          });
        }
      }
    } catch (err: any) {
      // Ignore record not found error as it is handled by the UI state (record will be null)
      if (err?.code === 'PGRST116') return;
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

  // Calculate pricing logic safely
  const parseCurrency = (val: string | number | undefined | null) => {
    if (!val) return 0;
    const str = val.toString().replace(/,/g, "");
    return parseFloat(str) || 0;
  };

  const sellingPrice = parseCurrency(booking.sellingPrice);
  const costPrice = parseCurrency(booking.buyingPrice);
  const profit = sellingPrice - costPrice;
  const profitPercent =
    costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : "0";

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
                Booking Management Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage refund, reissue, or cancellation for selected booking.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                  record.status === "REFUNDED"
                    ? "bg-green-50 text-green-700 ring-green-600/20"
                    : record.status === "SEND"
                      ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                      : record.refund_status === "Processing"
                        ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                        : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                }`}
              >
                {record.status === "REFUNDED"
                  ? "Refunded"
                  : record.status === "SEND"
                    ? "Requesting"
                    : record.refund_status === "Processing"
                      ? "Processing"
                      : "Request"}
              </span>
              <Link
                href={`/dashboard/manage-booking/edit/${id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>

        <FlightDetailsCard
          booking={booking}
          record={record}
          title="Flight Details"
          showRouteVisuals={true}
          showFinancials={true}
          financials={{
            sellingPrice,
            costPrice,
            profit,
            profitPercent,
          }}
        />

        {/* Progress Steps */}
        <div className="w-full px-4 sm:px-0">
          <div className="relative">
            <div className="absolute left-0 top-4 -mt-px w-full h-0.5 bg-slate-200" aria-hidden="true"></div>
            <ul className="relative flex w-full justify-between">
              {[
                {
                  id: "01",
                  name: "Request",
                  status:
                    record.status === "PENDING" &&
                    record.refund_status !== "Processing"
                      ? "current"
                      : "complete",
                  href: `/dashboard/manage-booking/view/${record.uid}`,
                },
                {
                  id: "02",
                  name: "Processing",
                  status:
                    record.refund_status === "Processing" &&
                    record.status !== "SEND" &&
                    record.status !== "REFUNDED"
                      ? "current"
                      : record.status === "SEND" || record.status === "REFUNDED"
                        ? "complete"
                        : "upcoming",
                  href: `/dashboard/manage-booking/edit/${record.uid}`,
                },
                {
                  id: "03",
                  name: "Requesting",
                  status:
                    record.status === "SEND"
                      ? "current"
                      : record.status === "REFUNDED"
                        ? "complete"
                        : "upcoming",
                  href: `/dashboard/manage-booking/edit/${record.uid}?tab=financial-summary`,
                },
                {
                  id: "04",
                  name: "Refunded",
                  status:
                    record.status === "REFUNDED" ? "current" : "upcoming",
                  href: `/dashboard/manage-booking/view/${record.uid}`,
                },
              ].map((step) => (
                <li key={step.name} className="flex flex-col items-center relative bg-transparent z-10">
                  <Link href={step.href} className="flex flex-col items-center group">
                    <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                      step.status === 'current' ? 'border-primary bg-primary text-white group-hover:bg-primary-hover' :
                      'border-slate-300 bg-white text-slate-500 group-hover:border-slate-400 group-hover:text-slate-600'
                    }`}>
                      {step.status === 'complete' ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        <span className="text-xs font-bold">{step.id}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors ${
                      step.status === 'current' ? 'text-primary group-hover:text-primary-hover' : 'text-slate-500 group-hover:text-slate-600'
                    }`}>
                      {step.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                history
              </span>
              Communication Log
            </h3>
          </div>
          <div className="p-6">
            <ol className="relative border-l border-slate-200 ml-2">
              <li className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 ring-4 ring-white">
                  <span
                    className="material-symbols-outlined text-orange-600"
                    style={{ fontSize: "14px" }}
                  >
                    hourglass_empty
                  </span>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold text-slate-900">
                  Waiting for Agency Response
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-slate-400">
                  Current Status
                </time>
                <p className="mb-2 text-sm font-normal text-slate-500">
                  Refund request has been sent to the partner agency. Awaiting
                  their confirmation on waiver policy.
                </p>
              </li>
              <li className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                  <span
                    className="material-symbols-outlined text-blue-600"
                    style={{ fontSize: "14px" }}
                  >
                    send
                  </span>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold text-slate-900">
                  Request Sent to Agency
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-slate-400">
                  24 Oct, 2023 11:45
                </time>
                <div className="p-3 text-xs italic font-normal text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                  Ref: AGY-REQ-2209. Forwarded via agency portal.
                </div>
              </li>
              <li className="mb-8 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                  <span
                    className="material-symbols-outlined text-slate-600"
                    style={{ fontSize: "14px" }}
                  >
                    mail
                  </span>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold text-slate-900">
                  Customer Notified
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-slate-400">
                  24 Oct, 2023 10:45
                </time>
                <p className="text-sm font-normal text-slate-500">
                  Receipt of refund request acknowledged via email.
                </p>
              </li>
              <li className="ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                  <span
                    className="material-symbols-outlined text-slate-600"
                    style={{ fontSize: "14px" }}
                  >
                    assignment_return
                  </span>
                </span>
                <h3 className="flex items-center mb-1 text-sm font-semibold text-slate-900">
                  Refund Requested
                </h3>
                <time className="block mb-2 text-xs font-normal leading-none text-slate-400">
                  24 Oct, 2023 10:30
                </time>
                <p className="text-sm font-normal text-slate-500">
                  By {getCustomerName(booking)} (Customer) - Reason: Medical
                </p>
              </li>
            </ol>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm mt-6">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    mail
                  </span>
                  Resend Notification
                </span>
                <span
                  className="material-symbols-outlined text-slate-400"
                  style={{ fontSize: "16px" }}
                >
                  chevron_right
                </span>
              </button>
              <button className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    receipt_long
                  </span>
                  Download Invoice
                </span>
                <span
                  className="material-symbols-outlined text-slate-400"
                  style={{ fontSize: "16px" }}
                >
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
