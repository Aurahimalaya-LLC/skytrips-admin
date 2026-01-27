"use client";

import { useState } from 'react';
import RecentBookings from '@/components/dashboard/RecentBookings';
import TicketSalesCard from '@/components/dashboard/TicketSalesCard';
import TotalRevenueCard from '@/components/dashboard/TotalRevenueCard';
import DateRangeFilter, { DateRange } from "@/components/DateRangeFilter";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
    label: "Last 30 Days",
  });

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
      {/* Date Picker / Quick Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold">Key Metrics</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <DateRangeFilter
            onRangeChange={setDateRange}
            initialRange={dateRange}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <TotalRevenueCard dateRange={dateRange} />

        {/* Ticket Sales */}
        <TicketSalesCard dateRange={dateRange} />

        {/* Customer Satisfaction */}
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">sentiment_satisfied</span>
            </div>
            <span className="flex items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-bold">+1%</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-3">Customer Satisfaction</p>
          <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">4.8/5</p>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <RecentBookings />
    </div>
  );
}
