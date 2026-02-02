"use client";

import { useState, useEffect } from "react";
import PaymentsTable from "@/components/dashboard/payments/PaymentsTable";

type ViewMode = 'customers' | 'agencies';

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [period, setPeriod] = useState("30D");
  const [viewMode, setViewMode] = useState<ViewMode>('customers');
  // Removing page-level isLoading as it's handled by the table, 
  // but we might want a small transition for the view switch if needed.
  // The table component handles its own loading state.

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
    <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-8">
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

        <div className="flex items-center gap-4">
          <button className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            Date Range: <span className="text-[#00A76F]">{dateRange}</span>
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["30D", "90D", "YTD"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  period === p 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards - Dynamic based on view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viewMode === 'customers' ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL INFLOW (SP)</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$482,900.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12.5% vs last month
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">RECEIVED PAYMENTS</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$412,500.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                85% Collection Rate
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENDING INFLOW</h3>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[18px]">pending</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$70,400.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                24 Invoices Pending
              </div>
            </div>
          </>
        ) : (
          <>
             <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL OUTFLOW (CP)</h3>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$320,150.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +8.2% vs last month
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PAID TO AGENCIES</h3>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$280,000.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                87% Settlement Rate
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENDING PAYOUTS</h3>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[18px]">pending_actions</span>
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-3 tracking-tight">$40,150.00</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                15 Settlements Due
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Payment Table */}
      <PaymentsTable viewMode={viewMode} />
      
    </div>
  );
}
