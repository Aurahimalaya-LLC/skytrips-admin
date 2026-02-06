"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useRecentSearches, type RecentSearchItem } from "@/hooks/useRecentSearches";

export default function RecentSearches() {
  const router = useRouter();
  const { recentSearches, removeSearch, clearSearches } = useRecentSearches();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isProcessing = loading || isPending;

  const handleSearch = async (item: RecentSearchItem) => {
    if (isProcessing) return;
    
    setLoading(true);
    try {
      if (item.tripType === "Multi-city" && item.segments) {
        // Re-execute multi-city search logic
        const payload = {
          segments: item.segments,
          passengers: item.passengers,
          class: item.travelClass,
        };
        const res = await fetch(`/api/amadeus/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
           console.error("Search failed");
           // Ideally show toast
           return;
        }
        const key = `mc_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(`amadeusCache:${key}`, JSON.stringify(json.raw || {}));
        const params = new URLSearchParams({
          type: "Multi-city",
          k: key,
        });
        startTransition(() => {
           router.push(`/dashboard/flights/results?${params.toString()}`);
        });
      } else {
        const params = new URLSearchParams({
          origin: item.origin,
          destination: item.destination,
          depart: item.departureDate,
          return: item.returnDate,
          adults: item.passengers.adults.toString(),
          children: item.passengers.children.toString(),
          infants: item.passengers.infants.toString(),
          class: item.travelClass,
          type: item.tripType,
        });
        startTransition(() => {
           router.push(`/dashboard/flights/results?${params.toString()}`);
        });
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (recentSearches.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Recent Searches
        </h2>
        <div className="text-center py-8 text-slate-500 text-sm">
           No recent searches found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Recent Searches
        </h2>
        {recentSearches.length > 0 && (
            <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
            >
                Clear All
            </button>
        )}
      </div>

      <div className="space-y-4">
        {recentSearches.map((item) => (
          <div
            key={item.id}
            onClick={() => !isProcessing && handleSearch(item)}
            className={`flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100 group ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSearch(item);
                }
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">flight</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                   {item.origin.split("(")[1]?.replace(")", "") || item.origin} 
                   <span className="text-slate-400 mx-1">→</span> 
                   {item.destination.split("(")[1]?.replace(")", "") || item.destination}
                </p>
                <p className="text-xs text-slate-500">
                    {item.departureDate} {item.returnDate ? `- ${item.returnDate}` : ""} • {item.passengers.adults + item.passengers.children + item.passengers.infants} Pax, {item.travelClass}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(item.id);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete search"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showClearConfirm && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 animate-in fade-in duration-200">
              <div className="text-center p-6">
                  <p className="font-bold text-slate-900 mb-4">Clear all recent searches?</p>
                  <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={() => {
                            clearSearches();
                            setShowClearConfirm(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600"
                      >
                          Clear All
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
