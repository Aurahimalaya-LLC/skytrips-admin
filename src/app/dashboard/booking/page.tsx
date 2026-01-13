"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";
import BookingModal from "./BookingModal";
import BookingRowMenu from "@/components/BookingRowMenu";


export default function BookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "desc",
  });

  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, pageSize, debouncedSearch, sortConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      console.log("Fetching bookings with Supabase SDK", {
        from,
        to,
        search: debouncedSearch,
      });
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Has Anon Key:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      let query = supabase
        .from("bookings")
        .select("*", { count: "exact" });

      // Handle Sorting
      if (sortConfig.key === 'travelDate') {
        // travelDate doesn't exist in DB, it's computed from IssueDay, issueMonth, issueYear
        // For now, let's sort by issueYear, then issueMonth (string sort), then IssueDay
        // Note: issueMonth is string (e.g., 'Oct '), so this won't be perfectly chronological 
        // without complex logic or a real travelDate column.
        // We'll sort by issueYear first.
        query = query
          .order('issueYear', { ascending: sortConfig.direction === "asc" })
          .order('issueMonth', { ascending: sortConfig.direction === "asc" })
          .order('IssueDay', { ascending: sortConfig.direction === "asc" });
      } else if (sortConfig.key === 'sellingPrice') {
        // Fallback to buyingPrice if sellingPrice is null
        query = query.order('sellingPrice', { ascending: sortConfig.direction === "asc", nullsFirst: false });
      } else {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === "asc" });
      }

      query = query.range(from, to);

      if (debouncedSearch) {
        const isNumeric = /^\d+$/.test(debouncedSearch);
        let orFilter = `travellerFirstName.ilike.*${debouncedSearch}*,travellerLastName.ilike.*${debouncedSearch}*,origin.eq.${debouncedSearch},destination.eq.${debouncedSearch},PNR.eq.${debouncedSearch}`;

        if (isNumeric) {
          orFilter += `,id.eq.${debouncedSearch},ticketNumber.ilike.*${debouncedSearch}*`;
        }

        query = query.or(orFilter);
      }

      const { data, count, error: fetchError } = await query;

      console.log("Query result:", { data, count, error: fetchError });

      if (fetchError) {
        console.error("Supabase error details:", {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        });
        throw fetchError;
      }

      setBookings(data || []);
      setTotalCount(count || 0);
      console.log("Successfully loaded bookings:", data?.length || 0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Failed to fetch bookings";
      const errorDetails = err.details ? ` - ${err.details}` : "";
      const errorHint = err.hint ? ` (Hint: ${err.hint})` : "";
      setError(errorMessage + errorDetails + errorHint);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <span className="material-symbols-outlined text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
    }
    return (
      <span className="material-symbols-outlined text-[16px] text-primary font-bold">
        {sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  };

  const handleCreate = () => {
    setEditingBooking(null);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (booking: Booking) => {
    // Navigate to booking details page
    router.push(`/dashboard/booking/${booking.id}`);
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsViewOnly(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    setActionLoading(id);
    try {
      const { error: deleteError } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to delete booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (booking: Booking) => {
    setActionLoading(-1);

    try {
      if (editingBooking?.id) {
        // Update
        const { error: updateError } = await supabase
          .from("bookings")
          .update(booking)
          .eq("id", editingBooking.id);

        if (updateError) throw updateError;
      } else {
        // Create
        const { error: createError } = await supabase
          .from("bookings")
          .insert([booking]);

        if (createError) throw createError;
      }

      setIsModalOpen(false);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to save booking");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-emerald-500";
      case "pending":
        return "bg-amber-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

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
          <li className="font-medium text-primary">Bookings</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track all customer flight reservations.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New Booking</span>
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search by Name, PNR or Route (Origin/Destination)"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
            <span className="hidden sm:inline">More Filters</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-600 mt-0.5">
              error
            </span>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">
                Error Loading Bookings
              </h3>
              <p className="text-red-700 text-sm">{error}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={fetchBookings}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
                <a
                  href="/dashboard/test-api"
                  className="text-sm bg-white text-red-600 border border-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors"
                >
                  Run Diagnostics
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
        {bookings.length === 0 && !error ? (
          <div className="flex-1 p-12 text-center flex flex-col items-center justify-center">
            <p className="text-slate-500 text-lg mb-4 font-display">
              No bookings found
            </p>
            <button
              onClick={handleCreate}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Create Your First Booking
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('id')}
                    aria-sort={sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      Booking ID
                      {renderSortIcon('id')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('travellerLastName')}
                    aria-sort={sortConfig.key === 'travellerLastName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      T. last name
                      {renderSortIcon('travellerLastName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('travellerFirstName')}
                    aria-sort={sortConfig.key === 'travellerFirstName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      T. First Name
                      {renderSortIcon('travellerFirstName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('airlines')}
                    aria-sort={sortConfig.key === 'airlines' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      Airline
                      {renderSortIcon('airlines')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('sellingPrice')}
                    aria-sort={sortConfig.key === 'sellingPrice' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      S.P
                      {renderSortIcon('sellingPrice')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('tripType')}
                    aria-sort={sortConfig.key === 'tripType' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      Trip Type
                      {renderSortIcon('tripType')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('PNR')}
                    aria-sort={sortConfig.key === 'PNR' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      PNR
                      {renderSortIcon('PNR')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('travelDate')}
                    aria-sort={sortConfig.key === 'travelDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      Travel Date
                      {renderSortIcon('travelDate')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort('origin')}
                    aria-sort={sortConfig.key === 'origin' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <div className="flex items-center gap-1">
                      Route
                      {renderSortIcon('origin')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-medium text-sm">
                        {booking.travellerLastName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                              `${booking.travellerFirstName} ${booking.travellerLastName}`
                            )}&background=random")`,
                          }}
                        ></div>
                        <span className="text-slate-900 font-medium text-sm">
                          {booking.travellerFirstName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{booking.airlines}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-semibold">
                        {booking.sellingPrice || booking.buyingPrice || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{booking.tripType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold">
                        {booking.PNR}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900">
                        {booking.travelDate || `${booking.IssueDay || ''} ${booking.issueMonth || ''} ${booking.issueYear || ''}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <span className="text-slate-600 font-bold">
                          {booking.origin}
                        </span>
                        <span className="material-symbols-outlined text-xs text-slate-400">
                          arrow_forward
                        </span>
                        {booking.transit && (
                          <>
                            <span className="text-slate-600 font-bold">
                              {booking.transit}
                            </span>
                            <span className="material-symbols-outlined text-xs text-slate-400">
                              arrow_forward
                            </span>
                          </>
                        )}
                        <span className="text-slate-600 font-bold">
                          {booking.destination}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="inline-flex flex-col items-end gap-2">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleView(booking)}
                            className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            aria-label="View booking"
                            tabIndex={0}
                          >
                            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-105">
                              visibility
                            </span>
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/booking/edit/${booking.id}`)}
                            className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                            aria-label="Edit booking"
                            tabIndex={0}
                          >
                            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 hover:scale-105">
                              edit
                            </span>
                          </button>
                        </div>
                        <BookingRowMenu
                          booking={booking}
                          onRefund={() => router.push(`/dashboard/booking/${booking.id}/manage/status?action=refund`)}
                          onReissue={() => router.push(`/dashboard/booking/${booking.id}/manage/status?action=reissue`)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-slate-500 font-display">
                Showing{" "}
                <span className="font-medium text-slate-900">
                  {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-900">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">{totalCount}</span>{" "}
                results
              </p>
              <div className="hidden sm:flex items-center gap-2 ml-4 border-l border-slate-100 pl-4">
                <span className="text-xs text-slate-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <nav
                aria-label="Pagination"
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-100 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>

                <div className="flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-100">
                  Page{" "}
                  <span className="mx-1 font-bold text-primary">
                    {currentPage}
                  </span>{" "}
                  of {totalPages || 1}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={
                    currentPage === totalPages || totalPages === 0 || loading
                  }
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-100 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onEdit={() => setIsViewOnly(false)}
        booking={editingBooking}
        isLoading={actionLoading === -1}
        isReadOnly={isViewOnly}
      />
    </div>
  );
}
