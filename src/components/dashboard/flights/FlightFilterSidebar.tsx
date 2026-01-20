"use client";

import { useState } from "react";

export default function FlightFilterSidebar() {
  // const [priceRange, setPriceRange] = useState(2800);
  const [selectedStops, setSelectedStops] = useState<string[]>(["0"]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(["sq", "ek"]);
  const [selectedTime, setSelectedTime] = useState<string>("daytime");

  const toggleStop = (val: string) => {
    setSelectedStops(prev => 
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const toggleAirline = (val: string) => {
    setSelectedAirlines(prev => 
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-4">
      <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-6">Detailed Filters</h2>

      {/* Price Range - REMOVED */}
      {/* <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-700">Price Range</span>
          <span className="text-sm font-bold text-primary">$450 - ${priceRange}</span>
        </div>
        <input 
          type="range" 
          min="450" 
          max="5000" 
          value={priceRange} 
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div> */}

      {/* Stops */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Stops</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedStops.includes("0")}
                onChange={() => toggleStop("0")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Non-stop</span>
            </div>
            <span className="text-xs font-medium text-slate-400">$520</span>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedStops.includes("1")}
                onChange={() => toggleStop("1")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">1 Stop</span>
            </div>
            <span className="text-xs font-medium text-slate-400">$450</span>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedStops.includes("2+")}
                onChange={() => toggleStop("2+")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">2+ Stops</span>
            </div>
            <span className="text-xs font-medium text-slate-400">$850</span>
          </label>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Airlines</h3>
        <div className="space-y-3">
          {[
            { id: "ek", name: "Emirates", price: "$850" },
            { id: "qr", name: "Qatar Airways", price: "$890" },
            { id: "sq", name: "Singapore Airlines", price: "$950" },
            { id: "sl", name: "SkyLink Airlines", price: "$675" },
            { id: "pc", name: "Premium Carrier", price: "$520" },
          ].map((airline) => (
            <label key={airline.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedAirlines.includes(airline.id)}
                  onChange={() => toggleAirline(airline.id)}
                  className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">{airline.name}</span>
              </div>
              <span className="text-xs font-medium text-slate-400">{airline.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-4">Departure Time</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "early", label: "Early Morning" },
            { id: "daytime", label: "Daytime" },
            { id: "evening", label: "Evening" },
            { id: "night", label: "Night" },
          ].map((time) => (
            <button
              key={time.id}
              onClick={() => setSelectedTime(time.id)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                selectedTime === time.id
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
