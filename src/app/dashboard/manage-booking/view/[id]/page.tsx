"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

  // Calculate pricing logic safely
  const sellingPrice = parseFloat(booking.sellingPrice || "0");
  const costPrice = parseFloat(booking.buyingPrice || "0");
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
              Management Details
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
            <span
              className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                record.status === "REFUNDED" 
                  ? "bg-green-50 text-green-700 ring-green-600/20"
                  : record.status === "SEND"
                    ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                    : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
              }`}
            >
              {record.status || "PENDING"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">
                flight
              </span>
              Flight Details
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Booking ID
                </label>
                <p className="mt-1 text-base font-medium text-slate-900 font-mono">
                  #{record.booking_id}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  PNR
                </label>
                <p className="mt-1 text-base font-medium text-slate-900 font-mono">
                  {booking.PNR || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Ticket No.
                </label>
                <p className="mt-1 text-base font-medium text-slate-900 font-mono">
                  {booking.travellers?.[0]?.eticketNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Passenger Name
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {booking.customer?.firstName ||
                    booking.travellers?.[0]?.firstName}{" "}
                  {booking.customer?.lastName ||
                    booking.travellers?.[0]?.lastName}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Route
                </label>
                <div className="mt-1 flex items-center gap-2 text-base font-medium text-slate-900">
                  <span>{booking.origin}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">
                    arrow_forward
                  </span>
                  <span>{booking.destination}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Issued Date
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {booking.IssueDay} {booking.issueMonth}, {booking.issueYear}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Selling Price</span>
                <span className="text-lg font-bold text-slate-900">
                  ${sellingPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Cost Price</span>
                <span className="text-lg font-bold text-slate-700">
                  ${costPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">Profit Margin</span>
                <span
                  className={`text-lg font-bold flex items-center gap-1 ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                  <span className="text-xs font-normal text-slate-500">
                    ({profitPercent}%)
                  </span>
                </span>
              </div>
            </div>
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
                  By {booking.customer?.firstName} (Customer) - Reason: Medical
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
