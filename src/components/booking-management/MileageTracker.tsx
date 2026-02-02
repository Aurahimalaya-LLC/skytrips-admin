"use client";

import React from "react";

interface MileageTrackerProps {
  itineraries?: any[];
}

const MileageTracker: React.FC<MileageTrackerProps> = ({ itineraries }) => {
  // Simple calculation for demonstration
  // In a real app, this would use the Haversine formula or an external API
  const calculateTotalMiles = () => {
    if (!itineraries) return 0;
    let total = 0;
    itineraries.forEach((itin) => {
      if (itin.segments) {
        total += itin.segments.length * 1250; // Mock value per segment
      }
    });
    return total;
  };

  const totalMiles = calculateTotalMiles();

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            insights
          </span>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            AI Mileage Analysis
          </h3>
        </div>
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase">
          Beta
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Estimated Trip Miles
            </p>
            <p className="text-2xl font-black text-slate-900">
              {totalMiles.toLocaleString()} <span className="text-xs font-bold text-slate-400">mi</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Eco Score
            </p>
            <p className="text-lg font-black text-emerald-600">A+</p>
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${Math.min((totalMiles / 15000) * 100, 100)}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
          This trip contributes approximately {Math.round(totalMiles * 0.4)}kg of CO2 offset through our partner programs.
        </p>
      </div>
    </div>
  );
};

export default MileageTracker;
