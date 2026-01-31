"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Booking {
  bookingId: number;
  customerName: string;
  bookingDate: string;
  serviceType: string;
  status: string;
  tripType: string;
  route: string;
  origin: string;
  destination: string;
}

export default function RecentBookings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recent'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/dashboard/recent-bookings?type=${activeTab}&limit=5`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'issued' || s === 'completed') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (s === 'confirmed' || s === 'hold') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (s === 'pending' || s === 'processing') return 'bg-amber-100 text-amber-700 border border-amber-200';
    if (s === 'cancelled' || s === 'failed') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-foreground text-lg font-bold">
            {activeTab === 'upcoming' ? 'Upcoming Bookings' : 'Recent Bookings'}
          </h3>
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === "upcoming"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === "recent"
                  ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Recent
            </button>
          </div>
        </div>
        <Link href="/dashboard/booking" className="text-sm text-primary font-medium hover:underline">
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider">Passenger</th>
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider">Route</th>
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-muted-foreground text-xs font-bold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  <div className="flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.bookingId} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    #{booking.bookingId}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-8 rounded-full bg-cover bg-center bg-slate-200" 
                        style={{ backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerName)}&background=random")` }}
                      ></div>
                      {booking.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {booking.route}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(booking.bookingDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status === 'Confirmed' ? 'Hold' : booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/dashboard/booking/${booking.bookingId}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary transition-all duration-200 inline-block"
                      aria-label={`View details for booking ${booking.bookingId}`}
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
