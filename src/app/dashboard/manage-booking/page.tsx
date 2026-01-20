"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useRouter } from "next/navigation";

export default function ManageBookingPage() {
  const router = useRouter();
  const [manageRows, setManageRows] = useState<ManageBooking[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

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
                <th className="px-6 py-4">Amount</th>
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : row.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {row.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700 font-medium">
                    {row.amount ? `$${Number(row.amount).toFixed(2)}` : "-"}
                  </td>
                  <td
                    className="px-6 py-3 text-slate-600 max-w-xs truncate"
                    title={
                      row.booking_details
                        ? JSON.stringify(row.booking_details)
                        : ""
                    }
                  >
                    {row.booking_details
                      ? `${(row.booking_details as any).origin || ""} ✈ ${(row.booking_details as any).destination || ""}`
                      : maskUid(row.uid)}
                  </td>
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
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-full hover:bg-blue-50"
                        title="Edit"
                        onClick={() =>
                          router.push(
                            `/dashboard/manage-booking/edit/${row.uid}`,
                          )
                        }
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
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
    </div>
  );
}
