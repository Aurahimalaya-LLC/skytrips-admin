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
                record.status === "Completed"
                  ? "bg-green-50 text-green-700 ring-green-600/20"
                  : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
              }`}
            >
              {record.status || "Pending"}
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
                  {booking.ticketNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase text-slate-500">
                  Passenger Name
                </label>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {booking.travellerFirstName} {booking.travellerLastName}
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
                edit_document
              </span>
              Management Action
            </h3>
          </div>
          <form className="flex flex-col">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label
                  className="block text-sm font-medium leading-6 text-slate-900"
                  htmlFor="requested-by"
                >
                  Requested by
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-500 shadow-sm ring-1 ring-inset ring-slate-300 bg-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-not-allowed"
                    disabled
                    id="requested-by"
                    name="requested-by"
                    readOnly
                    type="text"
                    value={requester?.name || "Loading..."}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <label
                  className="block text-sm font-medium leading-6 text-slate-900"
                  htmlFor="agency"
                >
                  Requested Agency
                </label>
                <div className="mt-2">
                  <input
                    className="block w-full rounded-md border-0 py-2 px-3 text-slate-500 shadow-sm ring-1 ring-inset ring-slate-300 bg-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 cursor-not-allowed"
                    disabled
                    id="agency"
                    name="agency"
                    readOnly
                    type="text"
                    value={requester?.agency || "Travel World Inc."}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block text-sm font-medium leading-6 text-slate-900"
                  htmlFor="reason"
                >
                  Reason for Action
                </label>
                <div className="mt-2">
                  <select
                    className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    id="reason"
                    name="reason"
                    defaultValue={record.reason || "Select a reason..."}
                  >
                    <option>Select a reason...</option>
                    <option>Customer Refund Request</option>
                    <option>Flight Cancellation</option>
                    <option>Schedule Change</option>
                    <option>Duplicate Booking</option>
                    <option>Ticket Reissue</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label
                  className="block text-sm font-medium leading-6 text-slate-900"
                  htmlFor="notes"
                >
                  Notes / Remarks
                </label>
                <div className="mt-2">
                  <textarea
                    className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    id="notes"
                    name="notes"
                    placeholder="Add any additional details about this request..."
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-200 mt-2">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    forward_to_inbox
                  </span>
                  Notify Customer
                </h4>
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          aria-describedby="notify-email-description"
                          defaultChecked
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          id="notify-email"
                          name="notify-email"
                          type="checkbox"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label
                          className="font-medium text-slate-900"
                          htmlFor="notify-email"
                        >
                          Send Email Update
                        </label>
                        <p
                          className="text-slate-500 text-xs"
                          id="notify-email-description"
                        >
                          Notify {booking.email || "customer"}
                        </p>
                      </div>
                    </div>
                    <div className="relative flex items-start">
                      <div className="flex h-6 items-center">
                        <input
                          aria-describedby="notify-sms-description"
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          id="notify-sms"
                          name="notify-sms"
                          type="checkbox"
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label
                          className="font-medium text-slate-900"
                          htmlFor="notify-sms"
                        >
                          Send SMS Notification
                        </label>
                        <p
                          className="text-slate-500 text-xs"
                          id="notify-sms-description"
                        >
                          Alert to {booking.phone || "phone"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium leading-6 text-slate-900"
                      htmlFor="notification-template"
                    >
                      Custom Notification Messages
                    </label>
                    <div className="mt-2">
                      <select
                        className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        id="notification-template"
                        name="notification-template"
                      >
                        <option>Select a message template...</option>
                        <option>Refund Processed Successfully</option>
                        <option>Ticket Reissued - New Details Attached</option>
                        <option>Booking Cancellation Confirmed</option>
                        <option>Flight Schedule Change Notification</option>
                        <option>Partial Refund Approved</option>
                        <option>Custom Message</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium leading-6 text-slate-900"
                      htmlFor="notification-message"
                    >
                      Message Content
                    </label>
                    <div className="mt-2">
                      <textarea
                        className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                        id="notification-message"
                        name="notification-message"
                        placeholder="e.g. Your refund has been processed successfully. Please allow 5-7 business days for the amount to reflect in your account."
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
              <button
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                type="submit"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                Confirm Action
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
