"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useRouter } from "next/navigation";
import SendSMSModal from "@/components/booking-management/SendSMSModal";

export default function ManageBookingPage() {
  const router = useRouter();
  const [manageRows, setManageRows] = useState<ManageBooking[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [smsRecipient, setSmsRecipient] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  const [actionStates, setActionStates] = useState<
    Record<string, "select_booking" | "cancel_booking">
  >({});

  useEffect(() => {
    fetchManageRows();
    const channel = supabase
      .channel("manage-booking")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manage_booking" },
        (payload) => {
          setManageRows((prev) => {
            const next = [...prev];
            if (payload.eventType === "INSERT") {
              next.unshift(payload.new as ManageBooking);
            } else if (payload.eventType === "UPDATE") {
              const idx = next.findIndex(
                (r) => r.uid === (payload.new as ManageBooking).uid,
              );
              if (idx >= 0) next[idx] = payload.new as ManageBooking;
            } else if (payload.eventType === "DELETE") {
              const idx = next.findIndex(
                (r) => r.uid === (payload.old as ManageBooking).uid,
              );
              if (idx >= 0) next.splice(idx, 1);
            }
            return next;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchManageRows = async () => {
    setManageLoading(true);
    setManageError(null);
    try {
      const { data, error } = await supabase
        .from("manage_booking")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setManageRows((data as ManageBooking[]) || []);
    } catch (err: unknown) {
      console.error("Manage rows fetch error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load manage booking rows";
      setManageError(msg);
    } finally {
      setManageLoading(false);
    }
  };

  const maskUid = (uid: string) => {
    if (!uid || uid.length <= 8) return uid;
    return `${uid.slice(0, 4)}••••••${uid.slice(-4)}`;
  };

  const getEditPath = (row: ManageBooking) => {
    // Always start at the reason page so user can see/edit it first, as requested.
    // Navigation to subsequent steps (flight details, financial summary) will happen via the "Next" buttons on each page.
    return `/dashboard/manage-booking/edit/${row.uid}`;
  };

  const getFlightDetails = (row: ManageBooking) => {
    const details = row.booking_details as Booking;
    if (!details) return maskUid(row.uid);

    let origin = details.origin || "";
    let dest = details.destination || "";
    let depTime = "";
    let arrTime = "";

    // Helper to extract code from "City (CODE)"
    const extractCode = (str: string) => {
      const match = str.match(/\(([A-Z]{3})\)/);
      return match ? match[1] : str;
    };

    // Helper to format time
    const formatTime = (dateStr?: string) => {
      if (!dateStr) return "";
      try {
        return new Date(dateStr).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };

    if (details.itineraries && details.itineraries.length > 0) {
      const segments = details.itineraries[0].segments;
      if (segments.length > 0) {
        const first = segments[0];
        const last = segments[segments.length - 1];
        origin = first.departure.iataCode || origin;
        dest = last.arrival.iataCode || dest;
        depTime = formatTime(first.departure.at);
        arrTime = formatTime(last.arrival.at);
      }
    } else {
      origin = extractCode(origin);
      dest = extractCode(dest);
      depTime = formatTime(details.departureDate);
      arrTime = formatTime(details.arrivalDate);
    }

    return (
      <div className="flex flex-col text-xs">
        <span className="font-bold text-slate-700">
          {origin} <span className="text-slate-400 mx-1">✈</span> {dest}
        </span>
        {(depTime || arrTime) && (
          <span className="text-slate-500 mt-0.5">
            {depTime} {arrTime ? `- ${arrTime}` : ""}
          </span>
        )}
      </div>
    );
  };
    
    const handleSendSMS = async (message: string) => {
      if (!smsRecipient?.phone) return;
      
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: smsRecipient.phone,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send SMS");
      }
    };

    return (
    <div className="max-w-7xl mx-auto w-full font-display">
      {/* Breadcrumbs */}
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </li>
          <li className="font-medium text-primary">Manage Booking</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Flight Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, search, and manage flight reservations, reissues, and refunds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/manage-booking/reasons")}
            aria-label="Manage Reason"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
            <span>Manage Reason</span>
          </button>
        </div>
      </div>

      {/* Search Modal - Removed per request */}

      {/* Manage Booking Table */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Manage Booking Records
          </h2>
          {manageLoading && (
            <div className="flex items-center gap-2 text-slate-500">
              <span className="size-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
              Loading…
            </div>
          )}
        </div>
        {manageError && (
          <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">
            {manageError}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Travellers</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {manageRows.map((row) => (
                <tr
                  key={row.uid}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-primary">
                    #{row.booking_id}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.type === "Refund"
                          ? "bg-red-100 text-red-800"
                          : row.type === "Reissue"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {row.type || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        row.status === "REFUNDED"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : row.status === "SEND"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                            : row.refund_status === "Processing"
                              ? "bg-purple-50 text-purple-700 ring-purple-600/20"
                              : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                      }`}
                    >
                      {row.status === "REFUNDED"
                        ? "Refunded"
                        : row.status === "SEND"
                          ? "Requesting"
                          : row.refund_status === "Processing"
                            ? "Processing"
                            : "Request"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                      {(() => {
                        const details = row.booking_details as any;
                        const selectedIds =
                          (row as any).selected_travellers || [];

                        if (
                          !details?.travellers ||
                          details.travellers.length === 0
                        ) {
                          return (
                            <span className="text-slate-500 text-xs">
                              No travellers
                            </span>
                          );
                        }

                        // If no specific travellers selected, show "All Travellers" or list all if few
                        // But wait, if selected_travellers is empty/null, it might mean ALL (legacy) or NONE (error)?
                        // Based on our logic, we send selected_travellers. If empty, maybe we shouldn't have created the request?
                        // Let's assume if it exists and has length, we filter.

                        const travellersToShow =
                          selectedIds.length > 0
                            ? details.travellers.filter((t: any) =>
                                selectedIds.includes(t.id || ""),
                              )
                            : details.travellers; // Fallback to all if none specified (or maybe logic dictates all)

                        // If IDs don't match (e.g. temp IDs), we might fallback to showing all or just count
                        const displayList =
                          travellersToShow.length > 0
                            ? travellersToShow
                            : details.travellers;

                        if (displayList.length > 2) {
                          return (
                            <span
                              className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium"
                              title={displayList
                                .map((t: any) => `${t.firstName} ${t.lastName}`)
                                .join(", ")}
                            >
                              {displayList.length} Travellers
                            </span>
                          );
                        }

                        return displayList.map((t: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                          >
                            {t.firstName} {t.lastName}
                          </span>
                        ));
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-3">{getFlightDetails(row)}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-slate-600 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100"
                        title="View"
                        onClick={() =>
                          router.push(
                            `/dashboard/manage-booking/view/${row.uid}`,
                          )
                        }
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                      <button
                        className={`text-blue-600 transition-colors p-1 rounded-full ${
                          row.refund_status === "Refunded" ||
                          row.refund_status === "Completed"
                            ? "opacity-50 cursor-not-allowed text-slate-400"
                            : "hover:text-blue-800 hover:bg-blue-50"
                        }`}
                        title={
                          row.refund_status === "Refunded" ||
                          row.refund_status === "Completed"
                            ? "Refund Completed"
                            : "Resume/Edit"
                        }
                        disabled={
                          row.refund_status === "Refunded" ||
                          row.refund_status === "Completed"
                        }
                        onClick={() => {
                          if (
                            row.refund_status !== "Refunded" &&
                            row.refund_status !== "Completed"
                          ) {
                            router.push(getEditPath(row));
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {row.refund_status === "Refunded" ||
                          row.refund_status === "Completed"
                            ? "lock"
                            : row.financial_breakdown ||
                                row.refund_status === "Processing" ||
                                row.reason
                              ? "resume"
                              : "edit"}
                        </span>
                      </button>
                      <button
                        className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded-full hover:bg-indigo-50"
                        title="Send SMS"
                        onClick={() => {
                          const details = row.booking_details as Booking;
                          const phone = details?.phone || "";
                          const name =
                            details?.travellers?.[0]?.firstName ||
                            details?.email ||
                            "Customer";
                          if (phone) {
                            setSmsRecipient({ name, phone });
                          } else {
                            alert("No phone number available for this booking");
                          }
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          sms
                        </span>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-50"
                        title="Void"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          block
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!manageLoading && manageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-slate-500"
                  >
                    No manage booking records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Section Container - Removed per request */}
      {smsRecipient && (
        <SendSMSModal
          isOpen={!!smsRecipient}
          onClose={() => setSmsRecipient(null)}
          recipient={smsRecipient}
          onSend={handleSendSMS}
        />
      )}
    </div>
  );
}
