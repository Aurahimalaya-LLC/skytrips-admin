"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PassengerForm from "@/components/dashboard/flights/booking/PassengerForm";
import BookingSummary from "@/components/dashboard/flights/booking/BookingSummary";
import { FlightOffer } from "@/types/flight-search";

export default function FlightBookingPage() {
  const searchParams = useSearchParams();
  const adults = Math.max(0, Number(searchParams.get("adults") || "1") || 0);
  const children = Math.max(0, Number(searchParams.get("children") || "0") || 0);
  const infants = Math.max(0, Number(searchParams.get("infants") || "0") || 0);
  const totalPassengers = adults + children + infants || 1;
  const [passengers, setPassengers] = useState(Array.from({ length: totalPassengers }, (_, i) => i + 1));

  const offer: FlightOffer = useMemo(() => {
    const flightId = searchParams.get("flightId") || "1";
    const airlineName = searchParams.get("airlineName") || "Premium Carrier";
    const airlineCode = searchParams.get("airlineCode") || "PC";
    const flightNumber = searchParams.get("flightNumber") || "FL-101";
    const aircraft = searchParams.get("aircraft") || "Airbus A350";

    const depCity = searchParams.get("depCity") || "London";
    const depCode = searchParams.get("depCode") || "LHR";
    const depTime = searchParams.get("depTime") || "10:15";
    const depDate = searchParams.get("depDate") || "Oct 24";

    const arrCity = searchParams.get("arrCity") || "New York";
    const arrCode = searchParams.get("arrCode") || "JFK";
    const arrTime = searchParams.get("arrTime") || "14:00";
    const arrDate = searchParams.get("arrDate") || "Oct 24";

    const duration = searchParams.get("duration") || "7h 45m";
    const stopsCount = Number(searchParams.get("stops") || "0");
    const price = Number(searchParams.get("price") || "490");
    const currency = searchParams.get("currency") || "USD";

    return {
      id: flightId,
      airline: {
        name: airlineName,
        code: airlineCode,
        logo: "https://pics.avs.io/200/200/EK.png",
      },
      flightNumber,
      aircraft,
      departure: {
        city: depCity,
        code: depCode,
        time: depTime,
        date: depDate,
      },
      arrival: {
        city: arrCity,
        code: arrCode,
        time: arrTime,
        date: arrDate,
      },
      duration,
      stops: { count: Number.isNaN(stopsCount) ? 0 : stopsCount },
      price: Number.isNaN(price) ? 0 : price,
      currency,
    };
  }, [searchParams]);

  // const addPassenger = () => {
  //   setPassengers(prev => [...prev, Math.max(...prev) + 1]);
  // };

  const removePassenger = (id: number) => {
    setPassengers(prev => prev.filter((p) => p !== id));
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
            
            {passengers.map((id, index) => {
              const isLead = index === 0;
              let typeLabel = "Adult";
              if (index >= adults && index < adults + children) typeLabel = "Child";
              if (index >= adults + children) typeLabel = "Infant";
              const label = isLead ? "Lead Passenger" : `Passenger ${index + 1} (${typeLabel})`;
              return (
                <PassengerForm
                  key={id}
                  id={id}
                  label={label}
                  onRemove={() => removePassenger(id)}
                  canRemove={index > 0}
                />
              );
            })}

            <div className="flex justify-between items-center pt-8">   
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95">
                Create a booking
                <span className="material-symbols-outlined text-[20px] fill-current">check_circle</span>
              </button>
            </div>

          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-4">
             <BookingSummary
               offer={offer}
               passengers={{ adults, children, infants }}
               netFare={Number(searchParams.get("netFare") || "") || undefined}
               taxes={Number(searchParams.get("taxes") || "") || undefined}
               total={Number(searchParams.get("total") || "") || undefined}
             />
          </div>

        </div>
      </div>
    </div>
  );
}
