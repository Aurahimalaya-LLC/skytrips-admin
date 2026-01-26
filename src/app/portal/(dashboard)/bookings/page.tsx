"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";

export default function MyTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    
    const dateStr = booking.departureDate || booking.travelDate;
    if (!dateStr) return filter === 'past'; // Assume past if no date? Or show in all.
    
    const travelDate = new Date(dateStr);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return travelDate >= now;
    } else {
      return travelDate < now;
    }
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your trips...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <div className="mt-4 sm:mt-0">
          <div className="bg-white rounded-md shadow-sm flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                filter === 'all' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                filter === 'upcoming' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                filter === 'past' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBookings.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No bookings found.
            </li>
          ) : (
            filteredBookings.map((booking, index) => (
              <li key={booking.id || booking.PNR || index} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-blue-600 truncate">
                            {booking.origin} &rarr; {booking.destination}
                        </p>
                        <p className="mt-1 flex items-center text-sm text-gray-500">
                            {booking.airlines} • {booking.flightNumber}
                        </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status || "Confirmed"}
                      </span>
                      <p className="mt-1 text-sm text-gray-500">
                        {booking.departureDate || booking.travelDate}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                         PNR: {booking.PNR}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      {/* Placeholder for View Details button or link */}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
