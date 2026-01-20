"use client";

import FlightSearchWidget from "@/components/dashboard/FlightSearchWidget";

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
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">history</span>
                      Recent Searches
                  </h2>
                  <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-slate-400">flight</span>
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-900 text-sm">LHR <span className="text-slate-400 mx-1">→</span> JFK</p>
                                      <p className="text-xs text-slate-500">Oct 24 - Oct 31 • 1 Adult, Economy</p>
                                  </div>
                              </div>
                              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
