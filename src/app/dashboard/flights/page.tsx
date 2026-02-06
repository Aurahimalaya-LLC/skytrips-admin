"use client";

import FlightSearchWidget from "@/components/dashboard/FlightSearchWidget";

import RecentSearches from "@/components/dashboard/RecentSearches";

export default function FlightsPage() {
  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      {/* Breadcrumbs */}
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </li>
          <li className="font-medium text-primary">Flights</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Flight Search
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and book flights for your customers. Real-time availability from global GDS.
        </p>
      </div>

      {/* Search Widget */}
      <div className="mb-10">
         <FlightSearchWidget />
      </div>

      {/* Recent Searches / Popular Routes (Placeholder content for visual completeness) */}
      <div className="grid grid-cols-1 gap-6">
          <div className="w-full">
              <RecentSearches />
          </div>
      </div>
    </div>
  );
}
