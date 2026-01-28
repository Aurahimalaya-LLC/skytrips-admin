"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Airline {
  id: string;
  name: string;
  iata_code: string;
  country: string;
  logo_url?: string;
  status: "Active" | "Inactive" | "Pending";
  airline_type?: string;
  alliance?: string;
  destinations_count?: number;
}

export default function AirlinesPage() {
  const router = useRouter();
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive" | "Pending"
  >("all");
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [airlineToDelete, setAirlineToDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAirlines(page, limit, statusFilter, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [page, limit, statusFilter, searchTerm]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/airlines/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAirlines = async (
    p: number,
    l: number,
    status: "all" | "Active" | "Inactive" | "Pending" = statusFilter,
    search: string = searchTerm
  ) => {
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(l),
      });

      if (status && status !== "all") {
        params.set("status", status);
      }

      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/airlines?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAirlines(data.data || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching airlines:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!airlineToDelete) return;

    try {
      const res = await fetch(`/api/airlines/${airlineToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchAirlines(page, limit, statusFilter);
      fetchStats();
    } catch (error) {
      console.error("Error deleting airline:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAirlineToDelete(null);
    }
  };

  const filteredAirlines = airlines;

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const visiblePageNumbers = (() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 2) {
      return [1, 2, 3, 4];
    }

    if (page >= totalPages - 1) {
      return [
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 1, page, page + 1, page + 2];
  })();

  const allCurrentSelected =
    filteredAirlines.length > 0 &&
    filteredAirlines.every((a) => selectedIds.includes(a.id));

  const toggleSelectAllCurrent = () => {
    if (allCurrentSelected) {
      const currentIds = filteredAirlines.map((a) => a.id);
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = filteredAirlines.map((a) => a.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (
    status: "Active" | "Inactive"
  ) => {
    if (selectedIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await fetch("/api/airlines/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update airlines");
      }
      await fetchAirlines(page, limit, statusFilter);
      await fetchStats();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status update error:", error);
      alert("Failed to update selected airlines. Please try again.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      const res = await fetch("/api/airlines/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete airlines");
      }
      await fetchAirlines(page, limit, statusFilter);
      await fetchStats();
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete selected airlines. Please try again.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Airlines Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage airline partners and their details.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">
            download
          </span>
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            Total Airlines
          </h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            Active Airlines
          </h3>
          <p className="text-3xl font-bold text-emerald-500">{stats.active}</p>
        </div>
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
          <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            Inactive Airlines
          </h3>
          <p className="text-3xl font-bold text-red-500">{stats.inactive}</p>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border/60 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search airlines..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Status:</span>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="status-filter"
                  value="all"
                  checked={statusFilter === "all"}
                  onChange={() => {
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="h-3 w-3 border-border text-primary focus:ring-primary"
                />
                <span>All</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="status-filter"
                  value="Active"
                  checked={statusFilter === "Active"}
                  onChange={() => {
                    setStatusFilter("Active");
                    setPage(1);
                  }}
                  className="h-3 w-3 border-border text-primary focus:ring-primary"
                />
                <span>Active</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="status-filter"
                  value="Inactive"
                  checked={statusFilter === "Inactive"}
                  onChange={() => {
                    setStatusFilter("Inactive");
                    setPage(1);
                  }}
                  className="h-3 w-3 border-border text-primary focus:ring-primary"
                />
                <span>Inactive</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="status-filter"
                  value="Pending"
                  checked={statusFilter === "Pending"}
                  onChange={() => {
                    setStatusFilter("Pending");
                    setPage(1);
                  }}
                  className="h-3 w-3 border-border text-primary focus:ring-primary"
                />
                <span>Pending</span>
              </label>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/airlines/create")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Airline
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="px-4 py-2 border-b border-border/60 flex items-center justify-between bg-muted/40">
            <p className="text-xs text-muted-foreground">
              Selected {selectedIds.length} airlines
            </p>
            <div className="flex items-center gap-2">
              {selectedIds.length === 1 && (
                <button
                  onClick={() =>
                    router.push(`/dashboard/airlines/${selectedIds[0]}`)
                  }
                  className="px-3 py-1.5 text-xs rounded-md border border-border bg-background hover:bg-muted text-foreground"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleBulkStatusUpdate("Active")}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50"
              >
                Set Active
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("Inactive")}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-background hover:bg-muted text-foreground disabled:opacity-50"
              >
                Set Inactive
              </button>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1.5 text-xs rounded-md border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="w-10 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAllCurrent}
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                </th>
                <th className="w-10 px-4 py-4">
                  <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                    drag_indicator
                  </span>
                </th>
                <th className="px-6 py-4">Logo</th>
                <th className="px-6 py-4">Airline Name</th>
                <th className="px-6 py-4">IATA</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Alliance</th>
                <th className="px-6 py-4">Destinations</th>
                <th className="px-6 py-4 text-right">Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredAirlines.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-muted-foreground"
                  >
                    No airlines found
                  </td>
                </tr>
              ) : (
                filteredAirlines.map((airline) => (
                  <tr
                    key={airline.id}
                    draggable
                    onDragStart={() => setDraggedId(airline.id)}
                    onDragEnter={() => {
                      if (airline.id !== draggedId) {
                        setDragOverId(airline.id);
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    onDrop={() => {
                      if (!draggedId || draggedId === airline.id) return;
                      setAirlines((prev) => {
                        const updated = [...prev];
                        const fromIndex = updated.findIndex(
                          (a) => a.id === draggedId
                        );
                        const toIndex = updated.findIndex(
                          (a) => a.id === airline.id
                        );
                        if (fromIndex === -1 || toIndex === -1) {
                          return prev;
                        }
                        const [moved] = updated.splice(fromIndex, 1);
                        updated.splice(toIndex, 0, moved);
                        return updated;
                      });
                      setDraggedId(null);
                      setDragOverId(null);
                    }}
                    className={`transition-colors ${
                      dragOverId === airline.id
                        ? "bg-muted/80"
                        : "hover:bg-muted/60"
                    } ${
                      draggedId === airline.id ? "opacity-70 cursor-grabbing" : ""
                    }`}
                  >
                    <td className="px-4 py-4 align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(airline.id)}
                        onChange={() => toggleSelectOne(airline.id)}
                        className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-4 text-muted-foreground cursor-grab align-middle">
                      <span className="material-symbols-outlined text-[18px]">
                        drag_indicator
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center p-1 overflow-hidden border border-border/60">
                        {airline.logo_url ? (
                          <img
                            src={airline.logo_url}
                            alt={airline.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-muted-foreground">
                            flight
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {airline.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">
                        {airline.iata_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">{airline.country}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs font-medium">
                        {airline.airline_type || "Full-service"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {airline.alliance ? (
                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium">
                          {airline.alliance}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {typeof airline.destinations_count === "number"
                          ? airline.destinations_count
                          : 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            airline.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : airline.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {airline.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/airlines/${airline.id}`)
                            }
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setAirlineToDelete(airline.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing {(page - 1) * limit + 1} to{" "}
          {Math.min(page * limit, totalCount)} of {totalCount} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 h-8 border border-border rounded-md disabled:opacity-50 hover:bg-muted flex items-center justify-center text-xs bg-background text-foreground"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_left
            </span>
          </button>
          {visiblePageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium flex items-center justify-center border ${
                pageNumber === page
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() =>
              setPage((p) =>
                p * limit >= totalCount ? p : p + 1
              )
            }
            disabled={page * limit >= totalCount}
            className="px-2 h-8 border border-border rounded-md disabled:opacity-50 hover:bg-muted flex items-center justify-center text-xs bg-background text-foreground"
          >
            <span className="material-symbols-outlined text-sm">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-border">
            <h2 className="text-xl font-bold mb-4">Delete Airline</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this airline? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAirlineToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-border">
            <h2 className="text-xl font-bold mb-4">Delete Selected Airlines</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.length} selected airlines?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={bulkActionLoading}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium disabled:opacity-50"
              >
                {bulkActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
