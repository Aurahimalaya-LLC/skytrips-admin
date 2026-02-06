import React from 'react';

interface RouteInfoPreviewProps {
  averageFlightTime?: string;
  distance?: string;
  cheapestMonth?: string;
  dailyFlights?: number;
}

export default function RouteInfoPreview({
  averageFlightTime,
  distance,
  cheapestMonth,
  dailyFlights,
}: RouteInfoPreviewProps) {
  // Helper to format months nicely if there are many
  const formatMonths = (monthsStr?: string) => {
    if (!monthsStr) return "Not set";
    const months = monthsStr.split(',').map(m => m.trim()).filter(Boolean);
    if (months.length === 0) return "Not set";
    if (months.length <= 2) return months.join(", ");
    return `${months[0]}, ${months[1]} +${months.length - 2} more`;
  };

  const hasData = averageFlightTime || distance || cheapestMonth || dailyFlights;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full max-w-2xl mx-auto"
      aria-label="Route Information Preview"
    >
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Live Preview
        </h4>
        <span className="text-xs text-slate-400">
          How it appears on the site
        </span>
      </div>

      {!hasData ? (
        <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
          Start filling in the route details to see the preview
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Average Flight Time */}
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-blue-50 border border-blue-100 transition-all hover:shadow-sm">
            <span className="material-symbols-outlined text-blue-500 mb-1" aria-hidden="true">schedule</span>
            <span className="text-xs text-slate-500 font-medium mb-1">Avg. Time</span>
            <span className="text-sm font-bold text-slate-800" aria-label={`Average flight time is ${averageFlightTime || 'not set'}`}>
              {averageFlightTime || "--"}
            </span>
          </div>

          {/* Distance */}
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100 transition-all hover:shadow-sm">
            <span className="material-symbols-outlined text-emerald-500 mb-1" aria-hidden="true">straighten</span>
            <span className="text-xs text-slate-500 font-medium mb-1">Distance</span>
            <span className="text-sm font-bold text-slate-800" aria-label={`Distance is ${distance || 'not set'}`}>
              {distance || "--"}
            </span>
          </div>

          {/* Cheapest Month */}
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-amber-50 border border-amber-100 transition-all hover:shadow-sm">
            <span className="material-symbols-outlined text-amber-500 mb-1" aria-hidden="true">calendar_month</span>
            <span className="text-xs text-slate-500 font-medium mb-1">Best Price</span>
            <span 
              className="text-sm font-bold text-slate-800 truncate w-full px-1" 
              title={cheapestMonth || ""}
              aria-label={`Cheapest months are ${cheapestMonth || 'not set'}`}
            >
              {formatMonths(cheapestMonth)}
            </span>
          </div>

          {/* Daily Flights */}
          <div className="flex flex-col items-center text-center p-3 rounded-lg bg-purple-50 border border-purple-100 transition-all hover:shadow-sm">
            <span className="material-symbols-outlined text-purple-500 mb-1" aria-hidden="true">flight_takeoff</span>
            <span className="text-xs text-slate-500 font-medium mb-1">Daily Flights</span>
            <span className="text-sm font-bold text-slate-800" aria-label={`Daily flights count is ${dailyFlights ?? 'not set'}`}>
              {dailyFlights ?? "--"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
