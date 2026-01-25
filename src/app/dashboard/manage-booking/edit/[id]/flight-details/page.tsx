"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import {
  getCustomerName,
  getCustomerEmail,
  getCustomerPhone,
} from "@/lib/booking-helpers";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SendEmailModal from "@/components/booking-management/SendEmailModal";

export default function FlightDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<ManageBooking | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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

  const selectedTravellerIds = (record as any).selected_travellers || [];
  const travellers = booking.travellers || [];
  const selectedTravellers = travellers.filter((t: any) =>
    selectedTravellerIds.includes(t.id),
  );

  // If no specific travellers are selected in the record, fall back to showing all travellers
  // or handle as per business logic. For now, let's show selected ones if any, else all.
  const displayTravellers =
    selectedTravellers.length > 0 ? selectedTravellers : travellers;

  const itinerary = booking.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const departureInfo = firstSegment?.departure?.at
    ? formatDateTime(firstSegment.departure.at)
    : "10:00 AM";

  const arrivalInfo = lastSegment?.arrival?.at
    ? formatDateTime(lastSegment.arrival.at)
    : "02:00 PM";

  const durationInfo = itinerary?.duration
    ? itinerary.duration.replace("PT", "").toLowerCase()
    : "N/A";

  const flightStatus =
    segments.length > 1 ? `${segments.length - 1} Stop(s)` : "Direct";

  // Calculate pricing logic safely
  const sellingPrice = parseFloat(booking.sellingPrice || "0");
  const costPrice = parseFloat(booking.buyingPrice || "0");
  const profit = sellingPrice - costPrice;
  const profitPercent =
    costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : "0";

  const handleSendEmail = async (data: {
    subject: string;
    message: string;
    template: string;
  }) => {
    try {
      // 1. Send the email
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: booking.email,
          subject: data.subject,
          message: data.message,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send email");
      }

      // 2. Update refund status to Processing
      const { error } = await supabase
        .from("manage_booking")
        .update({ refund_status: "Processing" })
        .eq("uid", id);

      if (error) {
        console.error("Error updating status:", error);
        // We don't throw here to avoid blocking the UI since email was sent
      }

      // Update local state if needed or show success message
      alert("Email sent successfully and status updated to Processing.");
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error("Error sending email:", err);
      throw err;
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full font-display flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <Link href="/dashboard/manage-booking" className="hover:text-primary">
            Manage Booking
          </Link>
          <span className="material-symbols-outlined text-[14px]">
            chevron_right
          </span>
          <span className="font-medium text-slate-900">
            BK-{record.booking_id} Details
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Flight Booking Details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Detailed view of booking #BK-{record.booking_id} and its history.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>
              Send Email
            </button>
            <Link
              href={`/dashboard/manage-booking/edit/${id}/financial-summary`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-orange-50/50">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">
                  pending_actions
                </span>
                Refund Request Summary
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                Waiting Response from Agency
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Reason
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {record.reason || "Customer Cancellation (Medical)"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Request Date
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {new Date(record.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Requested By
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {requester?.name || "Loading..."}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Handling Agency
                </div>
                <div className="text-sm text-slate-900 font-medium">
                  {requester?.agency || "Global Travels Inc."}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                  Notes / Remarks
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {record.reason_detail ||
                    "Request forwarded to handling agency. Awaiting confirmation regarding cancellation fees and refund eligibility from their side before processing."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">
                  airplane_ticket
                </span>
                Flight Information
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <span className="font-bold text-xs">
                        {firstSegment?.departure?.iataCode || booking.origin}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900">
                        {firstSegment?.departure?.iataCode || booking.origin}
                      </span>
                      <span className="text-xs text-slate-500">
                        Departure Airport
                      </span>
                      <span className="text-xs font-medium text-slate-700 mt-0.5">
                        {departureInfo}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-4 min-w-[100px] w-full sm:w-auto">
                    <span className="text-xs text-slate-400 mb-1">
                      {durationInfo !== "N/A" ? durationInfo : "Duration"}
                    </span>
                    <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                      <span className="absolute h-2 w-2 rounded-full bg-slate-300 left-0"></span>
                      <span
                        className="material-symbols-outlined absolute text-slate-400 bg-slate-50 px-1"
                        style={{
                          fontSize: "16px",
                          transform: "rotate(90deg)",
                        }}
                      >
                        flight
                      </span>
                      <span className="absolute h-2 w-2 rounded-full bg-slate-300 right-0"></span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1">
                      {flightStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <div className="flex flex-col text-right">
                      <span className="text-lg font-bold text-slate-900">
                        {lastSegment?.arrival?.iataCode || booking.destination}
                      </span>
                      <span className="text-xs text-slate-500">
                        Arrival Airport
                      </span>
                      <span className="text-xs font-medium text-slate-700 mt-0.5">
                        {arrivalInfo}
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <span className="font-bold text-xs">
                        {lastSegment?.arrival?.iataCode || booking.destination}
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
                      PNR
                    </div>
                    <div className="text-sm font-semibold text-slate-900 font-mono">
                      {booking.PNR || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                      Ticket No.
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {booking.travellers?.[0]?.eticketNumber || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                      Issued Date
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {booking.IssueDay} {booking.issueMonth},{" "}
                      {booking.issueYear}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                      Passenger Name
                    </div>
                    <div className="flex flex-col gap-2">
                      {displayTravellers.map((traveller: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {traveller.firstName?.[0]}
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {traveller.firstName} {traveller.lastName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                      Buying Price
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      ${costPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500 mb-1">
                      Selling Price
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      ${sellingPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
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
                    {new Date(record.created_at).toLocaleString()}
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
                    {new Date(record.created_at).toLocaleString()}
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
                    {new Date(record.created_at).toLocaleString()}
                  </time>
                  <p className="text-sm font-normal text-slate-500">
                    By {requester?.name || "Customer"} - Reason: {record.reason}
                  </p>
                </li>
              </ol>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
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
      {booking && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          recipient={{
            name: getCustomerName(booking),
            email: booking.email || "",
            phone: booking.phone,
            organization: (booking as any).companyName || "Individual",
            pnr: booking.PNR,
          }}
          initialTemplateId="refund_in_progress"
          onSend={handleSendEmail}
        />
      )}
    </div>
  );
}
