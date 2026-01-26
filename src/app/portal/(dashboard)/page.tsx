"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Booking } from "@/types";

export default function CustomerDashboard() {
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0 });
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: customer } = await supabase
          .from("customers")
          .select("firstName, lastName")
          .eq("auth_user_id", user.id)
          .single();
        
        if (customer) {
          setCustomerName(`${customer.firstName || "Traveler"} ${customer.lastName || ""}`);
        }

        // Fetch bookings
        // Note: RLS ensures we only see our own bookings
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (bookings) {
             const now = new Date();
             const upcoming = bookings.filter(b => {
                 const dateStr = b.departureDate || b.travelDate; 
                 if (!dateStr) return false;
                 return new Date(dateStr) >= now;
             });
             
             setUpcomingBookings(upcoming.slice(0, 3));
             setStats({
                 total: bookings.length,
                 upcoming: upcoming.length
             });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
     return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {customerName}!
        </h1>
        <p className="mt-1 text-gray-600">
          Here is an overview of your travel activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Upcoming Trips
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.upcoming}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Bookings
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.total}
            </dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg flex items-center justify-center">
          <div className="px-4 py-5 sm:p-6">
             <Link href="/portal/bookings" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All Bookings <span className="ml-1">&rarr;</span>
             </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Trips List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Next Trips
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {upcomingBookings.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
              No upcoming trips scheduled.
            </li>
          ) : (
            upcomingBookings.map((booking, index) => (
              <li key={booking.id || booking.PNR || index} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {booking.origin} &rarr; {booking.destination}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.departureDate || booking.travelDate || "Date TBD"}
                    </p>
                    <p className="text-xs text-gray-400">
                       PNR: {booking.PNR}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status || "Confirmed"}
                    </span>
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
