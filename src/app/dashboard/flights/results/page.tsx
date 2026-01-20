"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FlightFilterSidebar from "@/components/dashboard/flights/FlightFilterSidebar";
import FlightResultCard from "@/components/dashboard/flights/FlightResultCard";
import { FlightOffer } from "@/types/flight-search";

// Live data fetched from API route

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);

  // Extract params
  const origin = searchParams.get("origin") || "LHR";
  const destination = searchParams.get("destination") || "JFK";
  const departDate = searchParams.get("depart") || "Oct 24";
  const returnDate = searchParams.get("return") || "Oct 31";
  const typeParam = searchParams.get("type") || "Round Trip";
  const cacheKey = searchParams.get("k") || "";

  // Fetch Amadeus offers via server API or use cache
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        if (typeParam === "Multi-city" && cacheKey) {
          const cached = typeof window !== "undefined" ? sessionStorage.getItem(`amadeusCache:${cacheKey}`) : null;
          if (cached) {
            const offers = JSON.parse(cached) as FlightOffer[];
            setFlights(offers);
          } else {
            setFlights([]);
          }
        } else {
          const params = new URLSearchParams({
            origin,
            destination,
            depart: searchParams.get("depart") || "",
            return: searchParams.get("return") || "",
            adults: searchParams.get("adults") || "1",
            children: searchParams.get("children") || "0",
            infants: searchParams.get("infants") || "0",
            class: searchParams.get("class") || "Economy",
            type: searchParams.get("type") || "Round Trip",
          });
          const key = `amadeusCache:${params.toString()}`;
          const cached = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
          if (cached) {
            const offers = JSON.parse(cached) as FlightOffer[];
            setFlights(offers);
          } else {
            const res = await fetch(`/api/amadeus/search?${params.toString()}`);
            const json = await res.json();
            if (!res.ok || !json.ok) {
              console.error("Amadeus search error:", json);
              setFlights([]);
            } else {
              setFlights(json.offers || []);
            }
          }
        }
      } catch (e) {
        console.error("Fetch failed:", e);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [origin, destination, searchParams, typeParam, cacheKey]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Sticky Header Summary */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{(origin.match(/\(([^)]+)\)\s*$/)?.[1] || origin).split(' ')[0]}</span>
              <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span>
              <span className="text-2xl font-black text-slate-900">{(destination.match(/\(([^)]+)\)\s*$/)?.[1] || destination).split(' ')[0]}</span>
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
