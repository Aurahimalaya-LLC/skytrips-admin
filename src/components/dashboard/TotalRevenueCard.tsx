
"use client";

import { useState, useEffect } from 'react';
import { DateRange } from "@/components/DateRangeFilter";

export default function TotalRevenueCard({ dateRange }: { dateRange: DateRange }) {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (dateRange.from) queryParams.set('from', dateRange.from.toISOString());
        if (dateRange.to) queryParams.set('to', dateRange.to.toISOString());

        const response = await fetch(`/api/dashboard/stats?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRevenue(data.data.totalRevenue);
          }
        }
      } catch (error) {
        console.error('Failed to fetch total revenue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <span className="material-symbols-outlined text-green-600 dark:text-green-400">payments</span>
        </div>
        <span className="flex items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-bold">+12%</span>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-3">Total Revenue</p>
      <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">
        {loading ? (
          <span className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-24 rounded block" />
        ) : (
          revenue !== null ? formatCurrency(revenue) : '$0'
        )}
      </p>
    </div>
  );
}
