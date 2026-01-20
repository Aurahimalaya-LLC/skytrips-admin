"use client";

import { useEffect, useState } from "react";
import { FlightOffer } from "@/types/flight-search";

interface FlightDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: FlightOffer;
}

export default function FlightDetailsModal({ isOpen, onClose, offer }: FlightDetailsModalProps) {
  const [showModal, setShowModal] = useState(false);

  const [showLayoverTool, setShowLayoverTool] = useState(false);
  const [layoverPosition, setLayoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => setShowModal(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleLayoverEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLayoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setShowLayoverTool(true);
  };

  if (!showModal && !isOpen) return null;

  // Mock Data Generation for the rich UI
  const segments = (() => {
    const segs = [];
    if (offer.stops.count > 0) {
      // Mocking a multi-leg flight for visualization
      const stopCity = offer.stops.locations?.[0] || "Dubai (DXB)";
      const stopCode = stopCity.includes("(") ? stopCity.match(/\(([^)]+)\)/)?.[1] : "DXB";
      
      segs.push({
        id: "seg1",
        airline: offer.airline,
        flightNumber: offer.flightNumber,
        aircraft: offer.aircraft || "Boeing 777-300ER",
        class: "Economy (G)",
        dep: { ...offer.departure, terminal: "Terminal 5" },
        arr: { city: stopCity, code: stopCode, terminal: "Terminal 3", time: "16:15" },
        duration: "7h 15m"
      });
      segs.push({
        id: "seg2",
        airline: offer.airline,
        flightNumber: "BA 001", // Mock
        aircraft: "Boeing 787-9 Dreamliner",
        class: "Economy (G)",
        dep: { city: stopCity, code: stopCode, terminal: "Terminal 3", time: "19:30" },
        arr: { ...offer.arrival, terminal: "Terminal 7", time: "22:50" },
        duration: "8h 20m"
      });
    } else {
      segs.push({
        id: "seg1",
        airline: offer.airline,
        flightNumber: offer.flightNumber,
        aircraft: offer.aircraft || "Airbus A350-1000",
        class: "Economy (G)",
        dep: { ...offer.departure, terminal: "Terminal 5" },
        arr: { ...offer.arrival, terminal: "Terminal 4" },
        duration: offer.duration
      });
    }
    return segs;
  })();

  const inboundSegments = (() => {
     const segs = [];
     const stopCity = "Doha (DOH)";
     const stopCode = "DOH";
     
     segs.push({
        id: "in_seg1",
        airline: offer.airline,
        flightNumber: "BA 115",
        aircraft: "Boeing 777-200",
        class: "Economy (L)",
        dep: { city: offer.arrival.city, code: offer.arrival.code, terminal: "Terminal 8", time: "21:15" },
        arr: { city: stopCity, code: stopCode, terminal: "Terminal 1", time: "16:45" },
        duration: "11h 30m"
     });

     segs.push({
        id: "in_seg2",
        airline: offer.airline,
        flightNumber: "BA 116",
        aircraft: "Boeing 787-8",
        class: "Economy (L)",
        dep: { city: stopCity, code: stopCode, terminal: "Terminal 1", time: "18:15" },
        arr: { city: offer.departure.city, code: offer.departure.code, terminal: "Terminal 5", time: "23:00" },
        duration: "6h 45m"
     });
     
     return segs;
  })();

  const layoverDuration = "3h 15m"; // Mock
  const inboundLayoverDuration = "1h 30m"; // Mock

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-4xl bg-slate-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
      >
        {/* Header - Hidden or Minimal if needed, but the design shows sections with headers */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto overflow-x-hidden p-6 space-y-6">
          
          {/* OUTBOUND ITINERARY */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary rotate-45">flight</span>
                <h3 className="font-black text-slate-900 text-sm tracking-wider uppercase">Outbound Itinerary</h3>
              </div>
              <span className="text-sm font-bold text-slate-500">Total Duration: {offer.stops.count > 0 ? "14h 50m" : offer.duration}</span>
            </div>

            <div className="p-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-[47px] top-[40px] bottom-[40px] w-[2px] border-l-2 border-dashed border-blue-400 z-0"></div>
              {/* Top Node */}
              <div className="absolute left-[41px] top-[35px] w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-white shadow-sm z-10"></div>
              {/* Bottom Node */}
              <div className="absolute left-[41px] bottom-[35px] w-3.5 h-3.5 rounded-full border-2 border-blue-400 bg-white z-10"></div>

              <div className="space-y-8 pl-12">
                {segments.map((seg, idx) => (
                  <div key={seg.id}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left: Flight Info */}
                      <div className="flex-1">
                        {/* Airline Header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                            {seg.airline.logo ? (
                              <img src={seg.airline.logo} alt={seg.airline.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400">flight_sm</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                              {seg.airline.name} • {seg.flightNumber}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                              {seg.aircraft} • {seg.class}
                            </p>
                          </div>
                        </div>

                        {/* Times & Places */}
                        <div className="flex gap-12">
                          <div>
                            <p className="text-2xl font-black text-slate-900">{seg.dep.time}</p>
                            <p className="text-sm font-bold text-slate-600 mt-1">{seg.dep.city} ({seg.dep.code})</p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{seg.dep.terminal || "Terminal 1"}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-900">{seg.arr.time}</p>
                            <p className="text-sm font-bold text-slate-600 mt-1">{seg.arr.city || seg.arr.code} ({seg.arr.code})</p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{seg.arr.terminal || "Terminal 1"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amenities (Only show for first segment or if different) */}
                      {idx === 0 && (
                        <div className="lg:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 h-fit">
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <span className="material-symbols-outlined text-slate-400 text-[16px]">luggage</span>
                              Check-in: 30kg
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <span className="material-symbols-outlined text-slate-400 text-[16px]">backpack</span>
                              Cabin: 7kg
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-emerald-600">
                              <span className="material-symbols-outlined text-emerald-500 text-[16px]">restaurant</span>
                              Meals Included
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Layover Banner */}
                    {idx < segments.length - 1 && (
                      <div 
                        className="mt-8 mb-2 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-800 cursor-help relative group"
                        onMouseEnter={handleLayoverEnter}
                        onMouseLeave={() => setShowLayoverTool(false)}
                        role="button"
                        aria-label="Layover details"
                        tabIndex={0}
                      >
                        <span className="material-symbols-outlined">hourglass_empty</span>
                        <span className="text-sm font-bold">
                          Layover in {offer.stops.locations?.[0] || "Dubai (DXB)"}: {layoverDuration}
                        </span>
                        
                        {/* Tooltip Overlay */}
                        <div className={`fixed z-50 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-5 transition-all duration-200 pointer-events-none ${
                            showLayoverTool ? "opacity-100 translate-y-[-110%]" : "opacity-0 translate-y-[-100%]"
                          }`}
                          style={{ 
                            left: layoverPosition.x, 
                            top: layoverPosition.y - 10,
                            transform: 'translateX(-50%) translateY(-100%)' 
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-900">Layover Details</h4>
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded">Short Connection</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Description</p>
                              <p className="text-sm text-slate-700 leading-snug">Change of planes required. Baggage will be transferred automatically.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Terminal</p>
                                <p className="text-sm font-bold text-slate-700">T3 <span className="text-slate-400">→</span> T3</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Min. Time</p>
                                <p className="text-sm font-bold text-slate-700">60 mins</p>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-slate-100">
                               <a href="#" className="text-xs font-bold text-primary hover:text-blue-600 flex items-center gap-1">
                                 <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                 Airport Guide
                               </a>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* INBOUND ITINERARY (Mirrors Outbound Structure) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary rotate-45">flight</span>
                <h3 className="font-black text-slate-900 text-sm tracking-wider uppercase">Inbound Itinerary</h3>
              </div>
              <span className="text-sm font-bold text-slate-500">Total Duration: 19h 45m (1 Stop)</span>
            </div>

            <div className="p-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-[47px] top-[40px] bottom-[40px] w-[2px] border-l-2 border-dashed border-blue-400 z-0"></div>
              {/* Top Node */}
              <div className="absolute left-[41px] top-[35px] w-3.5 h-3.5 rounded-full bg-blue-400 border-2 border-white shadow-sm z-10"></div>
              {/* Bottom Node */}
              <div className="absolute left-[41px] bottom-[35px] w-3.5 h-3.5 rounded-full border-2 border-blue-400 bg-white z-10"></div>

              <div className="space-y-8 pl-12">
                {inboundSegments.map((seg, idx) => (
                  <div key={seg.id}>
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left: Flight Info */}
                      <div className="flex-1">
                        {/* Airline Header */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                            {seg.airline.logo ? (
                              <img src={seg.airline.logo} alt={seg.airline.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400">flight_sm</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                              {seg.airline.name} • {seg.flightNumber}
                            </h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                              {seg.aircraft} • {seg.class}
                            </p>
                          </div>
                        </div>

                        {/* Times & Places */}
                        <div className="flex gap-12">
                          <div>
                            <p className="text-2xl font-black text-slate-900">{seg.dep.time}</p>
                            <p className="text-sm font-bold text-slate-600 mt-1">{seg.dep.city} ({seg.dep.code})</p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{seg.dep.terminal || "Terminal 1"}</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-900">{seg.arr.time}</p>
                            <p className="text-sm font-bold text-slate-600 mt-1">{seg.arr.city || seg.arr.code} ({seg.arr.code})</p>
                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">{seg.arr.terminal || "Terminal 1"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amenities */}
                      {idx === 0 && (
                        <div className="lg:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 h-fit">
                          <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <span className="material-symbols-outlined text-slate-400 text-[16px]">luggage</span>
                              Check-in: 23kg
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                              <span className="material-symbols-outlined text-slate-400 text-[16px]">backpack</span>
                              Cabin: 7kg
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-emerald-600">
                              <span className="material-symbols-outlined text-emerald-500 text-[16px]">restaurant</span>
                              Meals Included
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Layover Banner */}
                    {idx < inboundSegments.length - 1 && (
                      <div className="mt-8 mb-2 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-800">
                        <span className="material-symbols-outlined">hourglass_empty</span>
                        <span className="text-sm font-bold">
                          Layover in Doha (DOH): {inboundLayoverDuration}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
