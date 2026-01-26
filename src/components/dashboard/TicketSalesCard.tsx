
"use client";

import { useState, useEffect } from 'react';
import { DateRange } from "@/components/DateRangeFilter";

export default function TicketSalesCard({ dateRange }: { dateRange: DateRange }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('type', 'recent');
        queryParams.set('limit', '1');
        if (dateRange.from) queryParams.set('from', dateRange.from.toISOString());
        if (dateRange.to) queryParams.set('to', dateRange.to.toISOString());

        const response = await fetch(`/api/dashboard/recent-bookings?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.meta) {
            setCount(data.meta.total);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticket sales count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [dateRange]);

  return (
    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">confirmation_number</span>
        </div>
        <span className="flex items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-bold">+8%</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-3">Ticket Sales</p>
      <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">
        {loading ? (
          <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-20 rounded block" />
        ) : (
          count !== null ? count.toLocaleString() : '0'
        )}
      </p>
    </div>
  );
}
