"use client";

import { useState, useEffect } from "react";
import FlightFaresTable from "@/components/dashboard/flight-fares/FlightFaresTable";
import { FlightFare } from "@/types/flight-fare";

interface Stats {
  totalFares: number;
  availableFares: number;
  soldOutFares: number;
  loading: boolean;
  error: string | null;
}

export default function FlightFaresPage() {
  const [stats, setStats] = useState<Stats>({
    totalFares: 0,
    availableFares: 0,
    soldOutFares: 0,
    loading: true,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/flight-fares?limit=1000');
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || 'Failed to fetch stats');

      const fares: FlightFare[] = result.data || [];
      const total = result.pagination?.total || fares.length;
      const available = fares.filter(f => f.availability_status === 'Available').length;
      const soldOut = fares.filter(f => f.availability_status === 'Sold Out').length;

      setStats({
        totalFares: total,
        availableFares: available,
        soldOutFares: soldOut,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching flight fare stats:", err);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load stats",
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  return (
    <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-8 min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Flight Fare Management</h1>
          <p className="text-slate-500 font-medium">Create, manage, and monitor flight fare inquiry records.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TOTAL FARES</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-[18px]">flight</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
            {stats.loading ? "..." : stats.totalFares}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-[11px] font-bold">
            Total active records
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AVAILABLE</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
            {stats.loading ? "..." : stats.availableFares}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
            Ready for booking
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">SOLD OUT / EXPIRED</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-[18px]">block</span>
            </div>
          </div>
          <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
            {stats.loading ? "..." : stats.soldOutFares}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-bold">
            Requires attention
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <FlightFaresTable onDataChange={() => setRefreshKey(prev => prev + 1)} />
    </div>
  );
}
