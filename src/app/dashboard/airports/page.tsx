"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Airport } from "@/types/airport";
import countriesData from "@/data/countries.json";

export default function AirportsPage() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [airportToDelete, setAirportToDelete] = useState<string | number | null>(null);
  
  // Bulk Actions
  const [selectedAirports, setSelectedAirports] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Use debounced values for fetching
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedCity(cityFilter);
      if (searchTerm !== debouncedSearch || cityFilter !== debouncedCity) {
        setPage(1); // Reset to page 1 on filter change
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, cityFilter]);

  const fetchAirports = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (debouncedCity) params.set("city", debouncedCity);
      if (countryFilter) params.set("country", countryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/airports?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAirports(data.data || []);
      setTotalCount(data.meta?.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (error) {
      // console.error("Error fetching airports:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, debouncedCity, countryFilter, statusFilter]);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  const confirmDelete = async () => {
    if (!airportToDelete) return;

    try {
      const res = await fetch(`/api/airports/${airportToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchAirports();
      setSelectedAirports((prev) => prev.filter(id => id !== String(airportToDelete)));
    } catch (error) {
      // console.error("Error deleting airport:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAirportToDelete(null);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAirports(airports.map(a => a.id));
    } else {
      setSelectedAirports([]);
    }
  };

  const toggleSelectAirport = (id: string) => {
    setSelectedAirports(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedAirports.length === 0) return;

    if (action === 'delete') {
      setIsBulkDeleteModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const updates = selectedAirports.map(id => 
        fetch(`/api/airports/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: action === 'activate' })
        })
      );
      
      await Promise.all(updates);
      fetchAirports();
      setSelectedAirports([]);
    } catch (error) {
      // console.error(`Error bulk ${action}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      setLoading(true);
      const deletions = selectedAirports.map(id => 
        fetch(`/api/airports/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletions);
      fetchAirports();
      setSelectedAirports([]);
    } catch (error) {
      // console.error("Error bulk deleting:", error);
    } finally {
      setIsBulkDeleteModalOpen(false);
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const visiblePageNumbers = (() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 2) {
      return [1, 2, 3, 4];
    }
    if (page >= totalPages - 1) {
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [page - 1, page, page + 1, page + 2];
  })();

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Airports Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage airport data and details.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/airports/create")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Airports</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <span className="material-symbols-outlined text-[24px]">check_circle</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Airports</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <span className="material-symbols-outlined text-[24px]">cancel</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Inactive Airports</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.inactive}</h3>
            </div>
          </div>
        </div>
      </div>

      {selectedAirports.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {selectedAirports.length} Selected
            </span>
            <span className="text-sm text-blue-600">
              Select all {totalCount} airports?
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkAction('activate')}
              disabled={loading}
              className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              disabled={loading}
              className="px-4 py-2 bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
              Deactivate
            </button>
            <div className="h-6 w-px bg-blue-200 mx-2" />
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={loading}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border/60">
          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full flex-wrap">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search name or IATA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              {/* City Filter */}
              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder="Filter by City"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>

              {/* Country Filter */}
              <div className="relative w-full sm:w-48">
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm appearance-none"
                >
                  <option value="">All Countries</option>
                  {countriesData.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px] pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-3 px-3 py-2 border border-input bg-background rounded-lg h-[40px] sm:h-auto whitespace-nowrap overflow-x-auto">
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={statusFilter === "active"}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary shrink-0"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={statusFilter === "inactive"}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary shrink-0"
                  />
                  Inactive
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={statusFilter === "all"}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary shrink-0"
                  />
                  All
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-[40px]">
                  <input
                    type="checkbox"
                    checked={airports.length > 0 && selectedAirports.length === airports.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4">IATA</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timezone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : airports.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-muted-foreground"
                  >
                    No airports found
                  </td>
                </tr>
              ) : (
                airports.map((airport) => (
                  <tr
                    key={airport.id}
                    className={`hover:bg-muted/60 transition-colors ${
                      selectedAirports.includes(airport.id) ? "bg-blue-50/50 hover:bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAirports.includes(airport.id)}
                        onChange={() => toggleSelectAirport(airport.id)}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">
                        {airport.iata_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{airport.name}</td>
                    <td className="px-6 py-4">{airport.city}</td>
                    <td className="px-6 py-4">{airport.country}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          airport.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {airport.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {airport.timezone || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/airports/${airport.id}`)
                          }
                          className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setAirportToDelete(airport.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
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
              setPage((p) => (p * limit >= totalCount ? p : p + 1))
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
            <h2 className="text-xl font-bold mb-4">Delete Airport</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this airport? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAirportToDelete(null);
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
            <h2 className="text-xl font-bold mb-4">Delete Airports</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete {selectedAirports.length} selected airports? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
