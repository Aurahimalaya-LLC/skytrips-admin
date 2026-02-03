"use client";

import { useState, useEffect } from "react";
import PaymentsTable from "@/components/dashboard/payments/PaymentsTable";
import DateRangeFilter from "@/components/DateRangeFilter";
import { supabase } from "@/lib/supabase";

export default function PaymentsToAgencyPage() {
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  
  const [stats, setStats] = useState({
    totalAmount: 0,
    count: 0,
    pendingCount: 0,
  });
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch quick stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        let query = supabase
          .from("view_unified_payments")
          .select("amount, status")
          .eq("payment_source", "Agency");
          
        if (dateRange.start) {
            query = query.gte("created_date", dateRange.start);
        }
        if (dateRange.end) {
            query = query.lte("created_date", dateRange.end);
        }
          
        const { data, error } = await query;
        
        if (error) throw error;
        
        const total = (data || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const pending = (data || []).filter(item => item.status === 'Pending').length;
        
        setStats({
            totalAmount: total,
            count: data?.length || 0,
            pendingCount: pending
        });
      } catch (err) {
        console.error("Error fetching agency payment stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, [dateRange]);

  const handleRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange({
      start: range.from ? range.from.toISOString() : null,
      end: range.to ? range.to.toISOString() : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-900">Payments to Agency</h2>
           <p className="text-sm text-slate-500">
             Track all payment transactions associated with agency bookings.
           </p>
        </div>
        
        <div className="w-full md:w-auto">
          <DateRangeFilter onRangeChange={handleRangeChange} />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</p>
          <div className="mt-2 flex items-baseline gap-2">
            {isLoadingStats ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded"></div>
            ) : (
                <span className="text-2xl font-black text-slate-900">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalAmount)}
                </span>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transactions</p>
           <div className="mt-2 flex items-baseline gap-2">
            {isLoadingStats ? (
                <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
                <span className="text-2xl font-black text-slate-900">{stats.count}</span>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
           <div className="mt-2 flex items-baseline gap-2">
            {isLoadingStats ? (
                <div className="h-8 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
                <span className={`text-2xl font-black ${stats.pendingCount > 0 ? 'text-amber-500' : 'text-slate-900'}`}>
                    {stats.pendingCount}
                </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <PaymentsTable 
        viewMode="agencies" 
        dateRange={dateRange} 
      />
    </div>
  );
}
