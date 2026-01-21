"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlightOffer } from "@/types/flight-search";
import FlightDetailsModal from "./FlightDetailsModal";
import FareBrandsCarousel from "./FareBrandsCarousel";

interface FlightResultCardProps {
  offer: FlightOffer;
}

export default function FlightResultCard({ offer }: FlightResultCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFares, setShowFares] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelectFare = (brandId: string) => {
    setIsNavigating(true);
    // In a real app, you would save selection to context/redux here
    const params = new URLSearchParams({
      flightId: offer.id,
      fareBrand: brandId,
    });
    router.push(`/dashboard/flights/book?${params.toString()}`);
  };

  return (
    <>
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all duration-300 group ${
        showFares ? 'ring-2 ring-primary border-primary shadow-md' : 'hover:shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Airline Logo & Info */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              {/* Use an image if available, else a generic icon */}
              {offer.airline.logo ? (
                  <img src={offer.airline.logo} alt={offer.airline.name} className="w-14 h-14 object-contain" />
              ) : (
                  <span className="material-symbols-outlined">flight_sm</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{offer.airline.name}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{offer.flightNumber} • {offer.aircraft}</p>
            </div>
          </div>

          {/* Flight Route & Duration */}
          <div className="flex-1 flex items-center justify-between w-full px-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{offer.departure.time}</p>
              <p className="text-sm font-bold text-slate-500">{offer.departure.code}</p>
            </div>

            {/* Visualization */}
            <div className="flex flex-col items-center flex-1 px-4">
              <p className="text-xs text-slate-400 mb-1">{offer.duration}</p>
              <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-center">
                <div className="w-full absolute top-0 h-full bg-slate-200"></div>
                {/* Stops indicators */}
                {offer.stops.count === 0 ? (
                  <div className="bg-white px-2 z-10 text-[10px] font-bold text-blue-500 uppercase tracking-wider">Non-stop</div>
                ) : (
                  <div className="flex items-center gap-1 bg-white px-2 z-10">
                      <span className="w-2 h-2 rounded-full border-2 border-slate-300"></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{offer.stops.count} Stop ({offer.stops.locations?.join(", ")})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{offer.arrival.time}</p>
              <p className="text-sm font-bold text-slate-500">{offer.arrival.code}</p>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col items-end gap-3 w-full md:w-auto min-w-[140px]">
            {/* <div className="text-right">
              <p className="text-3xl font-black text-slate-900">${offer.price.toFixed(2)}</p>
              <p className="text-xs text-slate-500 font-bold uppercase">Total Price</p>
            </div> */}
            
            <button 
              onClick={() => setShowFares(!showFares)}
              className={`w-full py-2.5 px-4 font-bold rounded-lg shadow-lg transition-all ${
                  showFares 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none" 
                  : "bg-primary text-white shadow-blue-500/20 hover:bg-blue-600 active:scale-95"
              }`}
              aria-expanded={showFares}
              aria-controls={`fares-${offer.id}`}
            >
              {showFares ? "Hide Fares" : "Select Flight"}
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white text-slate-600 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Integrated Fare Brands Carousel */}
        {showFares && (
            <div id={`fares-${offer.id}`} className={isNavigating ? "opacity-50 pointer-events-none transition-opacity" : ""}>
                <FareBrandsCarousel 
                    basePrice={offer.price} 
                    currency={offer.currency} 
                    onSelect={handleSelectFare} 
                />
            </div>
        )}
      </div>

      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="text-sm font-bold text-primary">Proceeding to booking...</p>
          </div>
        </div>
      )}

      <FlightDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        offer={offer} 
      />
    </>
  );
}
