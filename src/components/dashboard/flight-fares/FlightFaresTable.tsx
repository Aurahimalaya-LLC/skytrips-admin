"use client";

import { useState, useEffect, useCallback } from "react";
import { FlightFare, AvailabilityStatus } from "@/types/flight-fare";
import FlightFareForm from "./FlightFareForm";
import { useFlightFareRealtime } from "@/hooks/useFlightFareRealtime";

interface FlightFaresTableProps {
  onDataChange: () => void;
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function FlightFaresTable({ onDataChange }: FlightFaresTableProps) {
  const [data, setData] = useState<FlightFare[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFare, setEditingFare] = useState<FlightFare | undefined>(undefined);

  const fetchFares = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
      });

      if (searchTerm) params.append('departure', searchTerm); // Simple search by departure for now
      if (statusFilter !== "ALL") params.append('status', statusFilter);

      const response = await fetch(`/api/flight-fares?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch fares');

      setData(result.data || []);
      setTotalCount(result.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching flight fares:", err);
      setError(err instanceof Error ? err.message : "Failed to load flight fares.");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortField, sortOrder, searchTerm, statusFilter]);

  // Enable Real-time updates
  useFlightFareRealtime(() => {
    fetchFares();
    onDataChange();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFares();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchFares]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fare?")) return;

    try {
      const response = await fetch(`/api/flight-fares/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      fetchFares();
      onDataChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleStatusUpdate = async (fare: FlightFare, newStatus: AvailabilityStatus) => {
    try {
      const response = await fetch(`/api/flight-fares/${fare.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          availability_status: newStatus,
          version: fare.version // Optimistic locking
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update status');
      }

      fetchFares();
      onDataChange();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const StatusBadge = ({ status }: { status: AvailabilityStatus }) => {
    let color = "bg-gray-100 text-gray-800";
    if (status === 'Available') color = "bg-green-100 text-green-800";
    else if (status === 'Sold Out') color = "bg-amber-100 text-amber-800";
    else if (status === 'Cancelled') color = "bg-red-100 text-red-800";
    else if (status === 'Expired') color = "bg-purple-100 text-purple-800";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search Departure Code..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold Out">Sold Out</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingFare(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Fare
          </button>
          <button 
            onClick={() => fetchFares()}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {isLoading && data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p>Loading flight fares...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <span className="material-symbols-outlined text-3xl mb-2">error</span>
            <p>{error}</p>
            <button onClick={() => fetchFares()} className="mt-2 text-primary hover:underline">Retry</button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
             <span className="material-symbols-outlined text-4xl mb-3 opacity-20">flight</span>
             <p className="text-lg font-medium mb-1">No flight fares found</p>
             <p className="text-sm opacity-70">Try adjusting your filters or create a new fare record.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('flight_number')}>
                    Flight #
                  </th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Departure</th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('total_price')}>
                    Price
                  </th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex flex-col">
                        <span>{row.flight_number}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{row.airline_code} • {row.fare_class}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{row.departure_airport_code}</span>
                        <span className="material-symbols-outlined text-[14px] text-muted-foreground">arrow_forward</span>
                        <span className="font-bold">{row.arrival_airport_code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(row.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 font-black text-foreground">
                      {formatCurrency(row.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={row.availability_status} />
                        <select
                          className="bg-transparent border-none p-0 text-[10px] font-bold cursor-pointer focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          value={row.availability_status}
                          onChange={(e) => handleStatusUpdate(row, e.target.value as AvailabilityStatus)}
                        >
                          <option value="Available">Set Available</option>
                          <option value="Sold Out">Set Sold Out</option>
                          <option value="Cancelled">Set Cancelled</option>
                          <option value="Expired">Set Expired</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingFare(row);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="bg-muted/50 px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border border-input bg-background text-foreground rounded-md text-xs py-1 px-2 focus:outline-none"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
            
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount}
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900">
                {editingFare ? "Edit Flight Fare" : "Create New Flight Fare"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <FlightFareForm 
                fare={editingFare} 
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchFares();
                  onDataChange();
                }} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
