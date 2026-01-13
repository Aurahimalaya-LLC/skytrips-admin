"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Booking, ManageBooking } from "@/types";
import { useRouter } from "next/navigation";

export default function ManageBookingPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    bookingId: "",
    pnr: "",
    travellerName: "",
  });
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [manageRows, setManageRows] = useState<ManageBooking[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  const [actionStates, setActionStates] = useState<Record<string, 'select_booking' | 'cancel_booking'>>({});

  useEffect(() => {
    if (isContentVisible) {
      fetchBookings();
      fetchManageRows();
      const channel = supabase
        .channel("manage-booking")
        .on("postgres_changes", { event: "*", schema: "public", table: "manage_booking" }, (payload) => {
          setManageRows((prev) => {
            const next = [...prev];
            if (payload.eventType === "INSERT") {
              next.unshift(payload.new as ManageBooking);
            } else if (payload.eventType === "UPDATE") {
              const idx = next.findIndex((r) => r.uid === (payload.new as ManageBooking).uid);
              if (idx >= 0) next[idx] = payload.new as ManageBooking;
            } else if (payload.eventType === "DELETE") {
              const idx = next.findIndex((r) => r.uid === (payload.old as ManageBooking).uid);
              if (idx >= 0) next.splice(idx, 1);
            }
            return next;
          });
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isContentVisible]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("bookings")
        .select("*");

      if (searchParams.bookingId) {
        query = query.ilike('id', `%${searchParams.bookingId}%`);
      }
      if (searchParams.pnr) {
        query = query.ilike('PNR', `%${searchParams.pnr}%`);
      }
      if (searchParams.travellerName) {
        query = query.or(`travellerFirstName.ilike.%${searchParams.travellerName}%,travellerLastName.ilike.%${searchParams.travellerName}%`);
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;
      setSearchResults(data || []);
    } catch (err: unknown) {
      console.error("Search error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to search bookings";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      const msg = err instanceof Error ? err.message : "Failed to load manage booking rows";
      setManageError(msg);
    } finally {
      setManageLoading(false);
    }
  };

  const maskUid = (uid: string) => {
    if (!uid || uid.length <= 8) return uid;
    return `${uid.slice(0, 4)}••••••${uid.slice(-4)}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchBookings();
    setIsSearchModalOpen(false);
  };

  const clearSearch = () => {
    setSearchParams({ bookingId: "", pnr: "", travellerName: "" });
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
        <button 
          onClick={() => {
            setIsSearchModalOpen(true);
            setIsContentVisible(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New Manage Booking</span>
        </button>
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Search Booking to Manage</h3>
              <button 
                onClick={() => setIsSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Booking ID</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">confirmation_number</span>
                      <input
                        type="text"
                        placeholder="e.g. BK-1234"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchParams.bookingId}
                        onChange={(e) => setSearchParams({ ...searchParams, bookingId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">PNR Number</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">airplane_ticket</span>
                      <input
                        type="text"
                        placeholder="e.g. XJ5K9L"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
                        value={searchParams.pnr}
                        onChange={(e) => setSearchParams({ ...searchParams, pnr: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Traveller Name</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">person_search</span>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchParams.travellerName}
                        onChange={(e) => setSearchParams({ ...searchParams, travellerName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    )}
                    Search Bookings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Booking Table */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Manage Booking Records</h2>
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
                <th className="px-6 py-4">UID</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {manageRows.map((row) => (
                <tr key={row.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-mono text-primary">#{row.booking_id}</td>
                  <td className="px-6 py-3 text-slate-700">{maskUid(row.uid)}</td>
                  <td className="px-6 py-3 text-slate-600">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {!manageLoading && manageRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-slate-500">
                    No manage booking records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Section Container */}
      <div
        role="region"
        aria-live="polite"
        aria-hidden={!isContentVisible}
        className={`transition-all duration-300 ${isContentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden"}`}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        {!loading && searchResults.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-slate-400 text-3xl">search_off</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h3>
            <p className="text-slate-500 text-sm">
              Try adjusting your search criteria or double-check the booking details.
            </p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">PNR</th>
                    <th className="px-6 py-4">Traveller</th>
                    <th className="px-6 py-4">Flight Route</th>
                    <th className="px-6 py-4 text-right">Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchResults.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-primary">#{booking.id}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 bg-slate-100/50 rounded w-fit px-2 py-1">{booking.PNR}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{booking.travellerFirstName} {booking.travellerLastName}</div>
                        <div className="text-xs text-slate-500">{booking.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          {booking.origin}
                          <span className="material-symbols-outlined text-slate-400 text-[16px]">arrow_right_alt</span>
                          {booking.destination}
                        </div>
                        <div className="text-xs text-slate-500">{booking.airlines}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                            booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {booking.status || 'Unknown'}
                          </span>
                          <button 
                            onClick={() => router.push(`/dashboard/booking/${booking.id}/manage`)}
                            className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-all flex items-center gap-1"
                          >
                            View Details
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
