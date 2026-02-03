"use client";

import { useState, useEffect, useRef } from "react";
import PaymentsTable from "@/components/dashboard/payments/PaymentsTable";
import { supabase } from "@/lib/supabase";

type ViewMode = 'customers' | 'agencies';

interface DateRange {
  label: string;
  start: string | null;
  end: string | null;
}

interface Stats {
  totalInflow: number;
  totalPending: number;
  totalCompleted: number;
  pendingCount: number;
  completedCount: number;
  loading: boolean;
  error: string | null;
}

export default function PaymentsPage() {
  // Date Range State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    label: "Last 30 Days",
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    end: new Date().toISOString()
  });

  // Stats State
  const [stats, setStats] = useState<Stats>({
    totalInflow: 0,
    totalPending: 0,
    totalCompleted: 0,
    pendingCount: 0,
    completedCount: 0,
    loading: true,
    error: null
  });

  const [viewMode, setViewMode] = useState<ViewMode>('customers');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close Date Picker on Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Stats
  useEffect(() => {
    async function fetchStats() {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      try {
        let query = supabase
          .from('view_unified_payments')
          .select('amount, payment_source, status, selling_price, cost_price');

        // Apply View Mode Filter
        const sourceFilter = viewMode === 'customers' ? 'Customer' : 'Agency';
        query = query.eq('payment_source', sourceFilter);

        // Apply Date Filter
        if (dateRange.start) {
          query = query.gte('created_date', dateRange.start);
        }
        if (dateRange.end) {
          query = query.lte('created_date', dateRange.end);
        }

        let { data, error } = await query;

        // Fallback if cost_price/selling_price don't exist yet in the view (Error 42703)
        if (error && String(error.code) === '42703') {
          console.warn("View missing price columns, falling back to 'amount'");
          let fallbackQuery = supabase
            .from('view_unified_payments')
            .select('amount, payment_source, status')
            .eq('payment_source', viewMode === 'customers' ? 'Customer' : 'Agency');

          // Re-apply date filter for fallback
          if (dateRange.start) fallbackQuery = fallbackQuery.gte('created_date', dateRange.start);
          if (dateRange.end) fallbackQuery = fallbackQuery.lte('created_date', dateRange.end);

          const res = await fallbackQuery;
          data = res.data as any;
          error = res.error;
        }

        if (error) throw error;

        let inflow = 0;
        let pending = 0;
        let completed = 0;
        let pCount = 0;
        let cCount = 0;

        data?.forEach((item) => {
          // Use selling_price for Customers, cost_price for Agencies, fallback to amount
          const isCustomer = viewMode === 'customers';
          const price = isCustomer ? item.selling_price : item.cost_price;
          const amt = (Number(price) || Number(item.amount) || 0);
          
          const st = item.status?.toUpperCase() || '';
          
          inflow += amt; // Total volume

          if (st === 'COMPLETED' || st === 'PAID') {
            completed += amt;
            cCount++;
          } else if (st === 'PENDING' || st === 'PARTIAL') {
            pending += amt;
            pCount++;
          }
        });
        
        setStats({
          totalInflow: inflow,
          totalPending: pending,
          totalCompleted: completed,
          pendingCount: pCount,
          completedCount: cCount,
          loading: false,
          error: null
        });

      } catch (err) {
        console.error("Error fetching stats:", err);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: err instanceof Error ? err.message : "Failed to load stats" 
        }));
      }
    }

    fetchStats();
  }, [viewMode, dateRange]);

  // Handle Date Range Selection
  const handleDateRangeSelect = (option: string) => {
    const end = new Date().toISOString();
    let start = null;

    if (option === "Last 30 Days") {
      start = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    } else if (option === "Last 90 Days") {
      start = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString();
    } else if (option === "This Year") {
      start = new Date(new Date().getFullYear(), 0, 1).toISOString();
    } else if (option === "All Time") {
      start = null;
    }

    setDateRange({ label: option, start, end });
    setShowDatePicker(false);
  };


  useEffect(() => {
    const savedMode = sessionStorage.getItem('payment_view_mode') as ViewMode;
    if (savedMode && (savedMode === 'customers' || savedMode === 'agencies')) {
      // Use setTimeout to avoid synchronous state update warning during mount
      setTimeout(() => setViewMode(savedMode), 0);
    }
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    sessionStorage.setItem('payment_view_mode', mode);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-8 min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payments Transaction Listing</h1>
          <p className="text-slate-500 font-medium">Unified view of direct bookings and partner agency financial settlements.</p>
        </div>
        {/* Export buttons are now inside the table component */}
      </div>

      {/* Toggle & Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Main View Toggle */}
        <div className="bg-slate-100 p-1 rounded-xl inline-flex relative shadow-inner">
          <button
            onClick={() => handleViewChange('customers')}
            className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 z-10 flex items-center gap-2 ${
              viewMode === 'customers'
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Payments from Customers
          </button>
          <button
            onClick={() => handleViewChange('agencies')}
            className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 z-10 flex items-center gap-2 ${
              viewMode === 'agencies'
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">domain</span>
            Payments to Agency
          </button>
        </div>

        <div className="flex items-center gap-4 relative" ref={datePickerRef}>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Date Range: <span className="text-[#00A76F]">{dateRange.label}</span>
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-12 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 w-48 py-2 animate-in fade-in zoom-in-95 duration-200">
              {["Last 30 Days", "Last 90 Days", "This Year", "All Time"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleDateRangeSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors ${
                    dateRange.label === option ? "text-[#00A76F] bg-emerald-50" : "text-slate-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards - Dynamic based on view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viewMode === 'customers' ? (
          <>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TOTAL INFLOW (SP)</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? (
                  <span className="text-muted animate-pulse">Loading...</span>
                ) : stats.error ? (
                  <span className="text-destructive text-sm">Error</span>
                ) : (
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalInflow)
                )}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                {dateRange.label}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">RECEIVED PAYMENTS</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? "Loading..." : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalCompleted)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {stats.totalInflow > 0 ? ((stats.totalCompleted / stats.totalInflow) * 100).toFixed(1) : 0}% Collection Rate
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PENDING INFLOW</h3>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[18px]">pending</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? "Loading..." : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalPending)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {stats.pendingCount} Invoices Pending
              </div>
            </div>
          </>
        ) : (
          <>
             <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TOTAL OUTFLOW (CP)</h3>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? "Loading..." : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalInflow)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                Total Volume
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PAID TO AGENCIES</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? "Loading..." : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalCompleted)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                {stats.totalInflow > 0 ? ((stats.totalCompleted / stats.totalInflow) * 100).toFixed(1) : 0}% Settlement Rate
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PENDING PAYOUTS</h3>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                </div>
              </div>
              <div className="text-3xl font-black text-foreground mb-3 tracking-tight">
                {stats.loading ? "Loading..." : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalPending)}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {stats.pendingCount} Settlements Due
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Table Content */}
      <PaymentsTable viewMode={viewMode} dateRange={dateRange} />
    </div>
  );
}
