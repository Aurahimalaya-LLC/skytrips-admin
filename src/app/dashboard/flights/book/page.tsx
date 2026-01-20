"use client";

import { useState } from "react";
import Link from "next/link";
import PassengerForm from "@/components/dashboard/flights/booking/PassengerForm";
import BookingSummary from "@/components/dashboard/flights/booking/BookingSummary";
import { FlightOffer } from "@/types/flight-search";

// Mock offer data - In a real app this would come from context or props
const MOCK_OFFER: FlightOffer = {
  id: "1",
  airline: { name: "Premium Carrier", code: "PC", logo: "https://pics.avs.io/200/200/EK.png" },
  flightNumber: "FL-101",
  aircraft: "Airbus A350",
  departure: { city: "London", code: "LHR", time: "10:15", date: "Oct 24" },
  arrival: { city: "New York", code: "JFK", time: "14:00", date: "Oct 24" },
  duration: "7h 45m",
  stops: { count: 0 },
  price: 490.00,
  currency: "USD",
};

export default function FlightBookingPage() {
  const [passengers, setPassengers] = useState([1, 2]); // IDs of passengers

  // const addPassenger = () => {
  //   setPassengers(prev => [...prev, Math.max(...prev) + 1]);
  // };

  const removePassenger = (id: number) => {
    setPassengers(prev => prev.filter(p => p !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 tracking-tight">
          Passenger Info & Agency Commission
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content - Passenger Forms */}
          <div className="lg:col-span-8 space-y-6">
            
            {passengers.map((id, index) => (
              <PassengerForm 
                key={id} 
                id={id} 
                label={index === 0 ? "Lead Passenger" : `Passenger ${index + 1} (Adult)`}
                onRemove={() => removePassenger(id)}
                canRemove={index > 0} // Lead passenger cannot be removed
              />
            ))}

            <div className="flex justify-between items-center pt-8">
              <Link 
                href="/dashboard/flights/results" 
                className="inline-flex items-center gap-2 font-bold text-slate-500 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back to Flight Selection
              </Link>

              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95">
                Create a booking
                <span className="material-symbols-outlined text-[20px] fill-current">check_circle</span>
              </button>
            </div>

          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-4">
             <BookingSummary offer={MOCK_OFFER} passengerCount={passengers.length} />
          </div>

        </div>
      </div>
    </div>
  );
}
