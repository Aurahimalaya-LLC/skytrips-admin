"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FlightFilterSidebar from "@/components/dashboard/flights/FlightFilterSidebar";
import FlightResultCard from "@/components/dashboard/flights/FlightResultCard";
import { FlightOffer } from "@/types/flight-search";

// Mock Data
const MOCK_FLIGHTS: FlightOffer[] = [
  // ... (keep existing mock data)
  {
    id: "1",
    airline: { name: "Premium Carrier", code: "PC", logo: "https://pics.avs.io/200/200/EK.png" }, // Using Emirates as mock
    flightNumber: "FL-101",
    aircraft: "Airbus A350",
    departure: { city: "London", code: "LHR", time: "10:15" },
    arrival: { city: "New York", code: "JFK", time: "14:00" },
    duration: "7h 45m",
    stops: { count: 0 },
    price: 520.00,
    currency: "USD",
  },
  {
    id: "2",
    airline: { name: "Global Connect", code: "GC", logo: "https://pics.avs.io/200/200/QR.png" }, // Using Qatar as mock
    flightNumber: "GC-701",
    aircraft: "Boeing 787",
    departure: { city: "London", code: "LHR", time: "08:30" },
    arrival: { city: "New York", code: "JFK", time: "19:50" },
    duration: "11h 20m",
    stops: { count: 1, locations: ["DOH"] },
    price: 450.00,
    currency: "USD",
  },
  {
    id: "3",
    airline: { name: "SkyLink Airlines", code: "SL", logo: "https://pics.avs.io/200/200/SQ.png" }, // Using Singapore as mock
    flightNumber: "SL-442",
    aircraft: "Airbus A330",
    departure: { city: "London", code: "LHR", time: "13:45" },
    arrival: { city: "New York", code: "JFK", time: "18:00" },
    duration: "8h 15m",
    stops: { count: 0 },
    price: 675.00,
    currency: "USD",
  },
  {
    id: "4",
    airline: { name: "Emirates", code: "EK", logo: "https://pics.avs.io/200/200/EK.png" },
    flightNumber: "EK-001",
    aircraft: "A380-800",
    departure: { city: "London", code: "LHR", time: "14:20" },
    arrival: { city: "New York", code: "JFK", time: "20:00" },
    duration: "9h 40m",
    stops: { count: 1, locations: ["DXB"] },
    price: 850.00,
    currency: "USD",
  },
  {
    id: "5",
    airline: { name: "British Airways", code: "BA", logo: "https://pics.avs.io/200/200/BA.png" },
    flightNumber: "BA-117",
    aircraft: "Boeing 777",
    departure: { city: "London", code: "LHR", time: "08:25" },
    arrival: { city: "New York", code: "JFK", time: "11:05" },
    duration: "7h 40m",
    stops: { count: 0 },
    price: 620.00,
    currency: "USD",
  }
];

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);

  // Extract params
  const origin = searchParams.get("origin") || "LHR";
  const destination = searchParams.get("destination") || "JFK";
  const departDate = searchParams.get("depart") || "Oct 24";
  const returnDate = searchParams.get("return") || "Oct 31";

  // Simulate API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlights(MOCK_FLIGHTS);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Sticky Header Summary */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{origin.split(' ')[0]}</span>
              <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span>
              <span className="text-2xl font-black text-slate-900">{destination.split(' ')[0]}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
               <span className="material-symbols-outlined text-primary">calendar_month</span>
               {departDate} - {returnDate}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
             {["Refundable", "Major Airlines", "Any Stops"].map(filter => (
               <div key={filter} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap">
                 {filter}
                 <button className="hover:text-red-500 ml-1"><span className="material-symbols-outlined text-[14px]">close</span></button>
               </div>
             ))}
             <button className="text-xs font-bold text-primary hover:underline ml-2 whitespace-nowrap">Clear All</button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dashboard/flights" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Search
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
             <FlightFilterSidebar />
          </aside>

          {/* Results List */}
          <div className="lg:col-span-3">
            
            {/* Sort & Count Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{flights.length}</span> flights found
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
                <select className="bg-transparent text-sm font-bold text-primary border-none focus:ring-0 cursor-pointer py-0 pl-2 pr-8">
                  <option>Recommended</option>
                  <option>Cheapest First</option>
                  <option>Fastest First</option>
                </select>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-48">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-200 rounded"></div>
                          <div className="h-3 w-20 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                         <div className="h-8 w-20 bg-slate-200 rounded"></div>
                         <div className="h-8 w-40 bg-slate-200 rounded"></div>
                         <div className="h-8 w-20 bg-slate-200 rounded"></div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="space-y-6">
                {flights.map(offer => (
                  <FlightResultCard key={offer.id} offer={offer} />
                ))}

                {/* Load More */}
                <button className="w-full py-4 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-primary hover:text-primary transition-all mt-8">
                  Load More Results
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}