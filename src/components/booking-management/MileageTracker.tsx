"use client";

import { useState, useMemo } from "react";
import { FlightItinerary } from "@/types";
import { AIRPORT_COORDINATES, calculateDistance } from "@/lib/mileage";

interface MileageTrackerProps {
  itineraries?: FlightItinerary[];
}

export default function MileageTracker({ itineraries }: MileageTrackerProps) {
  const [unit, setUnit] = useState<"miles" | "km">("miles");
  const [expanded, setExpanded] = useState(false);

  const routeAnalysis = useMemo(() => {
    if (!itineraries || itineraries.length === 0) return null;

    let totalDistance = 0;
    const segments: Array<{
      from: string;
      to: string;
      distance: number;
      efficiency: number; // Simulated efficiency score
      stops: number;
    }> = [];

    itineraries.forEach((itinerary) => {
      itinerary.segments.forEach((segment) => {
        const fromCode = segment.departure.iataCode?.toUpperCase();
        const toCode = segment.arrival.iataCode?.toUpperCase();
        
        if (!fromCode || !toCode) return;

        const fromCoords = AIRPORT_COORDINATES[fromCode];
        const toCoords = AIRPORT_COORDINATES[toCode];

        if (fromCoords && toCoords) {
          const dist = calculateDistance(
            fromCoords.lat,
            fromCoords.lon,
            toCoords.lat,
            toCoords.lon,
            unit
          );
          totalDistance += dist;
          segments.push({
            from: fromCode,
            to: toCode,
            distance: dist,
            efficiency: Math.min(98, Math.floor(Math.random() * 10) + 88), // Mock 88-98%
            stops: 0, // Direct segment
          });
        } else {
          // Fallback if coords missing
          segments.push({
            from: fromCode,
            to: toCode,
            distance: 0,
            efficiency: 0,
            stops: 0,
          });
        }
      });
    });

    return { totalDistance, segments };
  }, [itineraries, unit]);

  if (!routeAnalysis) return null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <span className="material-symbols-outlined text-[18px]">route</span>
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
              AI Route Analysis
            </h3>
            <p className="text-[10px] font-medium text-slate-400">
              Smart Mileage Tracking
            </p>
          </div>
        </div>
        <button
          onClick={() => setUnit(unit === "miles" ? "km" : "miles")}
          className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
        >
          {unit === "miles" ? "Switch to KM" : "Switch to Miles"}
        </button>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Total Distance</span>
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900">
              {routeAnalysis.totalDistance.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
            <span className="text-xs font-bold text-slate-400 ml-1">
              {unit}
            </span>
          </div>
        </div>
        
        {/* Progress Visual */}
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
          {routeAnalysis.segments.map((seg, idx) => (
            <div
              key={idx}
              className={`h-full ${
                idx % 2 === 0 ? "bg-indigo-500" : "bg-blue-400"
              }`}
              style={{
                width: `${(seg.distance / routeAnalysis.totalDistance) * 100}%`,
              }}
            />
          ))}
        </div>
        
        <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>Origin</span>
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[12px]">eco</span>
                94% Efficient
            </span>
            <span>Dest.</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <span>Segment Breakdown</span>
          <span className={`material-symbols-outlined text-[16px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {expanded && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {routeAnalysis.segments.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-3 relative">
                {/* Timeline Line */}
                {idx !== routeAnalysis.segments.length - 1 && (
                  <div className="absolute left-[11px] top-6 bottom-[-12px] w-0.5 bg-slate-100" />
                )}
                
                <div className="size-6 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shrink-0 z-10 text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </div>
                
                <div className="flex-1 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">{segment.from}</span>
                      <span className="material-symbols-outlined text-[12px] text-slate-300">arrow_forward</span>
                      <span className="text-xs font-black text-slate-800">{segment.to}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600">
                      {segment.distance.toFixed(0)} {unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1">
                        <span className="text-[10px] font-medium text-slate-400">Efficiency</span>
                        <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${segment.efficiency}%` }} />
                        </div>
                     </div>
                     <span className="text-[10px] font-bold text-slate-500">
                        {segment.efficiency}% Score
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
