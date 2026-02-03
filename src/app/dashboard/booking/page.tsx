"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";
import BookingModal from "./BookingModal";
import BookingRowMenu from "@/components/BookingRowMenu";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import NotificationConfirmModal from "@/components/NotificationConfirmModal";

export default function BookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{
    withCustomerCount: number;
    withoutCustomerCount: number;
    confirmedCount: number;
    issuedCount: number;
    pendingCount: number;
    draftCount: number;
    cancelledCount: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationBooking, setNotificationBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });
  const [customerFilter, setCustomerFilter] = useState<
    "all"
    | "linked"
    | "unlinked"
  >("all");
  const [statusFilter, setStatusFilter] = useState<string>("Confirmed");
  const [selectedBookingIds, setSelectedBookingIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [isViewOnly, setIsViewOnly] = useState(false);

  const toIata = (value: unknown) => {
    const text = String(value || "").trim();
    if (!text) return "";
    const upper = text.toUpperCase();
    if (/^[A-Z]{3}$/.test(upper)) return upper;
    const matches = upper.match(/[A-Z]{3}/g);
    return matches?.[0] || "";
  };

  const toIsoStartUtc = (ymd: string) => {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(ymd)) return "";
    const d = new Date(`${ymd}T00:00:00.000Z`);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  };

  const toIsoEndExclusiveUtc = (ymd: string) => {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(ymd)) return "";
    const d = new Date(`${ymd}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime())) return "";
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBookings = useCallback(async () => {
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

      let query = supabase.from("bookings").select("*", { count: "exact" });

      // Handle Sorting
      if (sortConfig.key === "sellingPrice") {
        // Fallback to buyingPrice if sellingPrice is null
        query = query.order("sellingPrice", {
          ascending: sortConfig.direction === "asc",
          nullsFirst: false,
        });
      } else {
        query = query.order(sortConfig.key, {
          ascending: sortConfig.direction === "asc",
        });
      }

      query = query.range(from, to);

      if (debouncedSearch) {
        const isNumeric = /^\d+$/.test(debouncedSearch);
        // Deprecated fields removed from search filter
        let orFilter = `origin.eq.${debouncedSearch},destination.eq.${debouncedSearch},PNR.eq.${debouncedSearch}`;

        if (isNumeric) {
          orFilter += `,id.eq.${debouncedSearch}`;
        }

        query = query.or(orFilter);
      }

      if (createdFrom) {
        const startIso = toIsoStartUtc(createdFrom);
        if (startIso) query = query.gte("created_at", startIso);
      }

      if (createdTo) {
        const endIso = toIsoEndExclusiveUtc(createdTo);
        if (endIso) query = query.lt("created_at", endIso);
      }

      if (statusFilter) {
        if (statusFilter === "Confirmed") {
          query = query.in("status", ["Confirmed", "ON_HOLD"]);
        } else {
          query = query.eq("status", statusFilter);
        }
      }

      if (customerFilter === "linked") {
        query = query.or(
          "customer.neq.{},customerid.neq.00000000-0000-0000-0000-000000000000",
        );
      } else if (customerFilter === "unlinked") {
        query = query
          .or(
            "customerid.is.null,customerid.eq.00000000-0000-0000-0000-000000000000",
          )
          .or("customer.is.null,customer.eq.{}");
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
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      const errObj =
        typeof err === "object" && err !== null
          ? (err as { message?: string; details?: string; hint?: string })
          : undefined;
      const errorMessage = errObj?.message || "Failed to fetch bookings";
      const errorDetails = errObj?.details ? ` - ${errObj.details}` : "";
      const errorHint = errObj?.hint ? ` (Hint: ${errObj.hint})` : "";
      setError(errorMessage + errorDetails + errorHint);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    sortConfig,
    createdFrom,
    createdTo,
    customerFilter,
    statusFilter,
  ]);

  const fetchCounts = useCallback(async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const res = await fetch("/api/bookings/counts", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        const parsed =
          json && typeof json === "object"
            ? (json as {
                withCustomerCount?: unknown;
                withoutCustomerCount?: unknown;
                confirmedCount?: unknown;
                issuedCount?: unknown;
                pendingCount?: unknown;
                draftCount?: unknown;
                cancelledCount?: unknown;
              })
            : null;

        if (res.ok && parsed) {
          setCounts({
            withCustomerCount:
              typeof parsed.withCustomerCount === "number"
                ? parsed.withCustomerCount
                : 0,
            withoutCustomerCount:
              typeof parsed.withoutCustomerCount === "number"
                ? parsed.withoutCustomerCount
                : 0,
            confirmedCount:
              typeof parsed.confirmedCount === "number"
                ? parsed.confirmedCount
                : 0,
            issuedCount:
              typeof parsed.issuedCount === "number" ? parsed.issuedCount : 0,
            pendingCount:
              typeof parsed.pendingCount === "number"
                ? parsed.pendingCount
                : 0,
            draftCount:
              typeof parsed.draftCount === "number" ? parsed.draftCount : 0,
            cancelledCount:
              typeof parsed.cancelledCount === "number"
                ? parsed.cancelledCount
                : 0,
          });
          return;
        }
      } catch {}

      await wait(350);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentPageIds = bookings
      .map((b) => b.id)
      .filter((id): id is number => typeof id === "number");

    if (e.target.checked) {
      // Add current page IDs to selection
      setSelectedBookingIds((prev) => {
        const set = new Set([...prev, ...currentPageIds]);
        return Array.from(set);
      });
    } else {
      // Remove current page IDs from selection
      setSelectedBookingIds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedBookingIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .in("id", selectedBookingIds);

      if (error) throw error;

      await fetchBookings();
      setSelectedBookingIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err: unknown) {
      console.error("Bulk delete error:", err);
      alert("Failed to delete selected bookings");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <span className="material-symbols-outlined text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          unfold_more
        </span>
      );
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

  const handleSave = async (booking: Booking) => {
    setActionLoading(-1);

    try {
      const bookingToSave = { ...booking };
      const bookingExtras = booking as Booking & {
        customerFirstName?: string;
        customerLastName?: string;
      };

      // Handle New Customer Creation logic
      if (booking.contactType === "new" && booking.email) {
        console.log("Processing new customer creation for:", booking.email);

        // 1. Check if customer already exists
        const { data: existingCustomer, error: searchError } = await supabase
          .from("customers")
          .select("id")
          .eq("email", booking.email)
          .single();

        if (searchError && searchError.code !== "PGRST116") {
          // PGRST116 is "Row not found" - ignore that, but log others
          console.error("Error searching for existing customer:", searchError);
        }

        let customerIdToUse = existingCustomer?.id;

        if (!customerIdToUse) {
          // 2. Create new customer
          // Use the explicit first/last name fields from the booking form first, fallback to first traveller
          const firstName =
            bookingExtras.customerFirstName ||
            booking.travellers?.[0]?.firstName ||
            "Unknown";
          const lastName =
            bookingExtras.customerLastName ||
            booking.travellers?.[0]?.lastName ||
            "Traveller";

          const newCustomer = {
            firstName,
            lastName,
            email: booking.email,
            phone: booking.phone || "",
            country: booking.nationality || "Nepalese",
            isActive: "true",
            isVerified: "false",
            userType: "Traveler",
            isDisabled: "false",
            phoneCountryCode: "+977", // Default or extract
            dateOfBirth: booking.travellers?.[0]?.dob || booking.dob || "",
            gender: "N/A",
            address: {}, // JSONB default
            passport: {
              number:
                booking.passportNumber ||
                booking.travellers?.[0]?.passportNumber ||
                "",
              expiryDate:
                booking.passportExpiry ||
                booking.travellers?.[0]?.passportExpiry ||
                "",
              issueCountry: booking.nationality || "Nepalese",
            },
            // created_at: new Date().toISOString(), // Removed to let DB handle it or avoid error if column missing
            // socialProvider: 'email'
          };

          const { data: createdCustomer, error: createError } = await supabase
            .from("customers")
            .insert([newCustomer])
            .select("id")
            .single();

          if (createError) {
            console.error("Failed to create new customer:", createError);
            throw new Error(
              `Failed to create customer profile: ${createError.message}`,
            );
          }

          console.log("New customer created successfully:", createdCustomer.id);
          customerIdToUse = createdCustomer.id;
        } else {
          console.log(
            "Customer already exists, linking to ID:",
            customerIdToUse,
          );
        }

        // Update booking with the customer object and ID
        if (
          typeof bookingToSave.customer === "object" &&
          bookingToSave.customer !== null
        ) {
          (bookingToSave.customer as { id?: string }).id = customerIdToUse;
        } else {
          // Fallback construction if it wasn't an object
          bookingToSave.customer = {
            id: customerIdToUse,
            firstName: bookingExtras.customerFirstName,
            lastName: bookingExtras.customerLastName,
            email: booking.email,
            phone: booking.phone,
            country: booking.nationality,
          } as unknown as Booking["customer"];
        }
      }

      // Map agency to issuedthroughagency if needed
      if (
        (bookingToSave as unknown as Record<string, unknown>).agency &&
        !(bookingToSave as unknown as Record<string, unknown>)
          .issuedthroughagency
      ) {
        (bookingToSave as unknown as Record<string, unknown>).issuedthroughagency =
          (bookingToSave as unknown as Record<string, unknown>).agency;
      }

      // Remove temporary fields not present in the bookings table
      const fieldsToRemove = [
        "travellerFirstName",
        "travellerLastName",
        "customerFirstName",
        "customerLastName",
        "contactType",
        "customerType",
        "count",
        "agency", // Mapped to issuedthroughagency
      ];
      fieldsToRemove.forEach(
        (field) =>
          delete (bookingToSave as unknown as Record<string, unknown>)[field],
      );

      // ADDED: Sync status and bookingstatus
      if (bookingToSave.status) {
        (bookingToSave as Record<string, unknown>).bookingstatus = bookingToSave.status;
      }

      if (editingBooking?.id) {
        // Update
        const { error: updateError } = await supabase
          .from("bookings")
          .update(bookingToSave)
          .eq("id", editingBooking.id);

        if (updateError) throw updateError;
      } else {
        // Create
        const { error: createError } = await supabase
          .from("bookings")
          .insert([bookingToSave]);

        if (createError) throw createError;

        // Send confirmation email
        if (booking.email && booking.status !== "Draft") {
          try {
            await fetch("/api/send-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: booking.email,
                subject: `Booking Confirmation - PNR: ${booking.PNR}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Booking Confirmation</h2>
                    <p>Dear ${booking.travellers?.[0]?.firstName || "Customer"},</p>
                    <p>Your booking has been successfully created.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 5px 0;"><strong>PNR:</strong> ${
                        booking.PNR
                      }</p>
                      <p style="margin: 5px 0;"><strong>Route:</strong> ${
                        booking.origin
                      } ✈ ${booking.destination}</p>
                      <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${
                        booking.travelDate || "N/A"
                      }</p>
                    </div>
                    <p>Thank you for choosing SkyTrips.</p>
                  </div>
                `,
              }),
            });
          } catch (emailError) {
            console.error("Failed to send confirmation email", emailError);
          }
        }
      }

      setIsModalOpen(false);
      await fetchBookings();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message || "")
          : "";
      alert(message || "Failed to save booking");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;

    setActionLoading(bookingToDelete);
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingToDelete);

      if (error) throw error;

      await fetchBookings();
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      alert("Failed to delete booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIssueBooking = async (booking: Booking) => {
    if (!booking.id) return;
    setNotificationBooking(booking);
    setIsNotificationModalOpen(true);
  };

  const confirmIssueBooking = async () => {
    if (!notificationBooking?.id) return;

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          status: "Issued",
          bookingstatus: "Issued"
        })
        .eq("id", notificationBooking.id);

      if (updateError) throw updateError;

      // Optimistic update
      setBookings((prev) =>
        prev.map((b) => (b.id === notificationBooking.id ? { ...b, status: "Issued", bookingstatus: "Issued" } : b))
      );

      // Refresh counts
      fetchCounts();
    } catch (err: unknown) {
      console.error("Issue booking error:", err);
      throw err; // Re-throw so the modal can catch it
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
        <div className="flex gap-2">
          {selectedBookingIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">
                delete
              </span>
              <span>Delete ({selectedBookingIds.length})</span>
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>New Booking</span>
          </button>
        </div>
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
          <select
            className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Hold / On Hold</option>
            <option value="Issued">Issued</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreFilters((v) => !v)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                filter_list
              </span>
              <span className="hidden sm:inline">More Filters</span>
            </button>

            {showMoreFilters && (
              <div className="absolute right-0 mt-2 w-[320px] rounded-xl border border-slate-200 bg-white shadow-lg p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-900">Filters</p>
                  <button
                    type="button"
                    onClick={() => setShowMoreFilters(false)}
                    className="text-slate-500 hover:text-slate-700"
                    aria-label="Close filters"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Created From
                    </label>
                    <input
                      type="date"
                      value={createdFrom}
                      onChange={(e) => {
                        setCreatedFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Created To
                    </label>
                    <input
                      type="date"
                      value={createdTo}
                      onChange={(e) => {
                        setCreatedTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatedFrom("");
                      setCreatedTo("");
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          onClick={() =>
            setCustomerFilter((prev) => (prev === "linked" ? "all" : "linked"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            customerFilter === "linked"
              ? "border-primary ring-1 ring-primary"
              : "border-slate-200 hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">
                Bookings linked to customers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.withCustomerCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">link</span>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setCustomerFilter((prev) =>
              prev === "unlinked" ? "all" : "unlinked",
            )
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            customerFilter === "unlinked"
              ? "border-primary ring-1 ring-primary"
              : "border-slate-200 hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">
                Bookings without customer link
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.withoutCustomerCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined">link_off</span>
            </div>
          </div>
        </div>

        {/* Hold (was Confirmed) */}
        <div
          onClick={() =>
            setStatusFilter((prev) => (prev === "Confirmed" ? "" : "Confirmed"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            statusFilter === "Confirmed"
              ? "border-blue-600 ring-1 ring-blue-600"
              : "border-slate-200 hover:border-blue-600/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">Hold</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.confirmedCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">pause_circle</span>
            </div>
          </div>
        </div>

        {/* Issued (New) */}
        <div
          onClick={() =>
            setStatusFilter((prev) => (prev === "Issued" ? "" : "Issued"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            statusFilter === "Issued"
              ? "border-emerald-600 ring-1 ring-emerald-600"
              : "border-slate-200 hover:border-emerald-600/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">Issued</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.issuedCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() =>
            setStatusFilter((prev) => (prev === "Pending" ? "" : "Pending"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            statusFilter === "Pending"
              ? "border-amber-500 ring-1 ring-amber-500"
              : "border-slate-200 hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">Pending</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.pendingCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined">hourglass_top</span>
            </div>
          </div>
        </div>

        {/* Draft */}
        <div
          onClick={() =>
            setStatusFilter((prev) => (prev === "Draft" ? "" : "Draft"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            statusFilter === "Draft"
              ? "border-slate-500 ring-1 ring-slate-500"
              : "border-slate-200 hover:border-slate-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">Drafts</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.draftCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
          </div>
        </div>

        {/* Cancelled */}
        <div
          onClick={() =>
            setStatusFilter((prev) => (prev === "Cancelled" ? "" : "Cancelled"))
          }
          className={`rounded-xl border bg-white shadow-sm p-5 cursor-pointer transition-all ${
            statusFilter === "Cancelled"
              ? "border-red-500 ring-1 ring-red-500"
              : "border-slate-200 hover:border-red-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-semibold">Cancelled</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {counts ? counts.cancelledCount.toLocaleString() : "—"}
              </p>
            </div>
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">cancel</span>
            </div>
          </div>
        </div>
      </div>

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
                  <th scope="col" className="pl-6 py-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={
                        bookings.length > 0 &&
                        bookings.every(
                          (b) => b.id && selectedBookingIds.includes(b.id),
                        )
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("id")}
                    aria-sort={
                      sortConfig.key === "id"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      Booking ID
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("created_at")}
                    aria-sort={
                      sortConfig.key === "created_at"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      Created At
                      {renderSortIcon("created_at")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("travellerFirstName")}
                    aria-sort={
                      sortConfig.key === "travellerFirstName"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      T. First Name
                      {renderSortIcon("travellerFirstName")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("sellingPrice")}
                    aria-sort={
                      sortConfig.key === "sellingPrice"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      S.P
                      {renderSortIcon("sellingPrice")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("tripType")}
                    aria-sort={
                      sortConfig.key === "tripType"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      Trip Type
                      {renderSortIcon("tripType")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("status")}
                    aria-sort={
                      sortConfig.key === "status"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {renderSortIcon("status")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("PNR")}
                    aria-sort={
                      sortConfig.key === "PNR"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      PNR
                      {renderSortIcon("PNR")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer group select-none hover:bg-slate-100 transition-colors"
                    onClick={() => handleSort("origin")}
                    aria-sort={
                      sortConfig.key === "origin"
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    <div className="flex items-center gap-1">
                      Route
                      {renderSortIcon("origin")}
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
                    <td className="pl-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                        checked={
                          !!booking.id && selectedBookingIds.includes(booking.id)
                        }
                        onChange={() =>
                          booking.id && handleSelectOne(booking.id)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => handleView(booking)}
                        className="text-primary hover:underline font-semibold"
                        aria-label={`View booking ${booking.id}`}
                      >
                        {booking.id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 text-sm">
                        {(booking.created_at || booking.inserted_at || booking.createdAt)
                          ? new Date(booking.created_at || booking.inserted_at || booking.createdAt!).toLocaleString()
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(
                              `${
                                booking.travellers?.[0]?.firstName ||
                                booking.contact_details?.name?.firstName ||
                                (booking as Record<string, any>).flight_data?.travelers?.[0]?.name?.firstName ||
                                ""
                              } ${
                                booking.travellers?.[0]?.lastName ||
                                booking.contact_details?.name?.lastName ||
                                (booking as Record<string, any>).flight_data?.travelers?.[0]?.name?.lastName ||
                                ""
                              }`,
                            )}&background=random")`,
                          }}
                        ></div>
                        <span className="text-slate-900 font-medium text-sm">
                          {booking.travellers?.[0]?.firstName || 
                           booking.contact_details?.name?.firstName ||
                           (booking as Record<string, any>).flight_data?.travelers?.[0]?.name?.firstName || 
                           "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-semibold">
                        {booking.sellingPrice || booking.buyingPrice || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600">{booking.tripType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        disabled={booking.status === "Issued" || actionLoading === booking.id}
                        onClick={() => handleIssueBooking(booking)}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-all ${
                          booking.status === "Confirmed" || booking.status === "ON_HOLD"
                            ? "bg-blue-50 text-blue-700 ring-blue-600/20 hover:bg-blue-100 cursor-pointer"
                            : booking.status === "Issued"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 cursor-default"
                            : booking.status === "Pending"
                            ? "bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-100 cursor-pointer"
                            : booking.status === "Draft"
                            ? "bg-slate-50 text-slate-700 ring-slate-600/20 hover:bg-slate-100 cursor-pointer"
                            : booking.status === "Cancelled"
                            ? "bg-red-50 text-red-700 ring-red-600/20 cursor-default"
                            : "bg-slate-50 text-slate-700 ring-slate-600/20 hover:bg-slate-100 cursor-pointer"
                        } ${actionLoading === booking.id ? "opacity-50 cursor-wait" : ""}`}
                        title={booking.status !== "Issued" && booking.status !== "Cancelled" ? "Click to Issue" : ""}
                      >
                        {actionLoading === booking.id ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin mr-1">
                            sync
                          </span>
                        ) : null}
                        {(booking.status === "Confirmed" || booking.status === "ON_HOLD"
                          ? "Hold"
                          : booking.status) || "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold">
                        {booking.PNR || booking.pnr || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <span className="text-slate-600 font-bold">
                          {toIata(booking.origin) || "N/A"}
                        </span>
                        <span className="material-symbols-outlined text-xs text-slate-400">
                          arrow_forward
                        </span>
                        {booking.transit && (
                          <>
                            <span className="text-slate-600 font-bold">
                              {toIata(booking.transit)}
                            </span>
                            <span className="material-symbols-outlined text-xs text-slate-400">
                              arrow_forward
                            </span>
                          </>
                        )}
                        <span className="text-slate-600 font-bold">
                          {toIata(booking.destination) || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="inline-flex flex-col items-end gap-2">
                        <BookingRowMenu
                          booking={booking}
                          onView={() => handleView(booking)}
                          onEdit={() =>
                            router.push(`/dashboard/booking/edit/${booking.id}`)
                          }
                          onRefund={() =>
                            router.push(`/dashboard/manage-booking`)
                          }
                          onReissue={() => router.push(`/dashboard/booking/`)}
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
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
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

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => !actionLoading && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={!!actionLoading && actionLoading === bookingToDelete}
      />

      <DeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => !bulkActionLoading && setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        isDeleting={bulkActionLoading}
        title="Delete Selected Bookings"
        message={`Are you sure you want to delete ${selectedBookingIds.length} selected booking(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedBookingIds.length} Booking${
          selectedBookingIds.length !== 1 ? "s" : ""
        }`}
      />

      {isNotificationModalOpen && notificationBooking && (
        <NotificationConfirmModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          onConfirm={confirmIssueBooking}
          booking={notificationBooking}
        />
      )}
    </div>
  );
}
