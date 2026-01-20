"use client";

import { useState, useRef, useEffect } from "react";
import AirportAutocomplete from "@/components/AirportAutocomplete";
import { useRouter } from "next/navigation";

interface FlightSearchWidgetProps {
  className?: string;
}

const AIRLINES = [
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "SQ", name: "Singapore Airlines" },
  { code: "CX", name: "Cathay Pacific" },
  { code: "BA", name: "British Airways" },
  { code: "QF", name: "Qantas" },
  { code: "UA", name: "United Airlines" },
  { code: "AA", name: "American Airlines" },
];

export default function FlightSearchWidget({ className = "" }: FlightSearchWidgetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType] = useState("Round Trip");
  const departRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    class: "Economy",
  });
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showAirlineDropdown, setShowAirlineDropdown] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const airlineDropdownRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        airlineDropdownRef.current &&
        !airlineDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAirlineDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    returnDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAirlineToggle = (code: string) => {
    setSelectedAirlines((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handlePassengerChange = (type: string, operation: "inc" | "dec") => {
    setPassengers((prev) => {
      const current = prev[type as keyof typeof prev];
      if (typeof current !== 'number') return prev;
      
      if (operation === "dec" && current <= 0) return prev;
      if (type === "adults" && operation === "dec" && current <= 1) return prev; // Min 1 adult
      return {
        ...prev,
        [type]: operation === "inc" ? current + 1 : current - 1,
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.origin) newErrors.origin = "Origin is required";
    if (!formData.destination) newErrors.destination = "Destination is required";
    if (!formData.departureDate) newErrors.departureDate = "Departure date is required";
    if (tripType === "Round Trip" && !formData.returnDate) {
      newErrors.returnDate = "Return date is required";
    }
    if (
      formData.departureDate &&
      formData.returnDate &&
      new Date(formData.returnDate) < new Date(formData.departureDate)
    ) {
      newErrors.returnDate = "Return date cannot be before departure";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;

    setLoading(true);
    
    // Simulate API call / Search
    try {
      // Construct query params
      const params = new URLSearchParams({
        origin: formData.origin,
        destination: formData.destination,
        depart: formData.departureDate,
        return: formData.returnDate,
        adults: passengers.adults.toString(),
        children: passengers.children.toString(),
        infants: passengers.infants.toString(),
        class: passengers.class,
        type: tripType,
      });

      console.log("Searching flights with:", params.toString());
      
      // router.push(`/dashboard/flights/results?${params.toString()}`);
      router.push(`/dashboard/flights/results?${params.toString()}`);
      
    } catch (error) {
      console.error("Search failed", error);
      setLoading(false);
    }
  };

  const swapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${className}`}>
      {/* Trip Type Tabs */}
      <div className="flex gap-2 mb-6">
        {["Round Trip", "One Way", "Multi-city"].map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tripType === type
                ? "bg-primary text-white shadow-md shadow-blue-200"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Search Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Origin & Destination Group */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-0 relative">
          <div className="relative z-10">
            <AirportAutocomplete
              label="Origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              icon="flight_takeoff"
            />
            {errors.origin && <p className="text-red-500 text-xs mt-1 absolute">{errors.origin}</p>}
          </div>

          {/* Swap Button (Absolute centered on desktop, hidden/different on mobile) */}
          <button
            onClick={swapLocations}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-primary hover:bg-slate-50 hover:scale-110 transition-all hidden md:flex"
            aria-label="Swap locations"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          </button>

          <div className="relative z-0 md:pl-2">
            <AirportAutocomplete
              label="Destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              icon="flight_land"
            />
             {errors.destination && <p className="text-red-500 text-xs mt-1 absolute">{errors.destination}</p>}
          </div>
        </div>

        {/* Dates Group */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
              Departure
            </label>
            <div className="relative">
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                ref={departRef}
                className={`block w-full h-12 pl-4 pr-10 rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium ${
                    errors.departureDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-200"
                }`}
              />
              <button
                type="button"
                aria-label="Open departure date picker"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
                onClick={() => {
                  const el = departRef.current;
                  if (!el) return;
                  const withPicker = el as HTMLInputElement & { showPicker?: () => void };
                  withPicker.showPicker?.();
                  el.focus();
                  el.click();
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  calendar_today
                </span>
              </button>
            </div>
             {errors.departureDate && <p className="text-red-500 text-xs mt-1 absolute">{errors.departureDate}</p>}
          </div>

          <div className="relative">
            <label className={`block text-sm font-bold mb-2 tracking-tight ${tripType === "One Way" ? "text-slate-300" : "text-slate-700"}`}>
              Return
            </label>
            <div className="relative">
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                min={formData.departureDate || new Date().toISOString().split("T")[0]}
                disabled={tripType === "One Way"}
                ref={returnRef}
                className={`block w-full h-12 pl-4 pr-10 rounded-lg border shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium ${
                    tripType === "One Way" ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                } ${errors.returnDate ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""}`}
              />
              <button
                type="button"
                aria-label="Open return date picker"
                disabled={tripType === "One Way"}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 ${tripType === "One Way" ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-slate-600"}`}
                onClick={() => {
                  if (tripType === "One Way") return;
                  const el = returnRef.current;
                  if (!el) return;
                  const withPicker = el as HTMLInputElement & { showPicker?: () => void };
                  withPicker.showPicker?.();
                  el.focus();
                  el.click();
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  calendar_today
                </span>
              </button>
            </div>
             {errors.returnDate && <p className="text-red-500 text-xs mt-1 absolute">{errors.returnDate}</p>}
          </div>
        </div>

        {/* Passengers & Class */}
        <div className="lg:col-span-3 relative">
          <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
            Passengers & Class
          </label>
          <button
            type="button"
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          >
            <div className="flex items-center gap-2 overflow-hidden">
               <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>
                  group
                </span>
              <span className="text-sm font-bold text-slate-700 truncate">
                {passengers.adults + passengers.children + passengers.infants} Traveller, {passengers.class}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </button>

          {/* Passenger Dropdown */}
          {showPassengerDropdown && (
            <div className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Class Selection */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Cabin Class</label>
                  <select 
                    value={passengers.class}
                    onChange={(e) => setPassengers(p => ({...p, class: e.target.value}))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                      <option>Economy</option>
                      <option>Premium Economy</option>
                      <option>Business</option>
                      <option>First Class</option>
                  </select>
              </div>

              <div className="space-y-4">
                {[
                  { type: "adults", label: "Adults", sub: "12+ years" },
                  { type: "children", label: "Children", sub: "2-11 years" },
                  { type: "infants", label: "Infants", sub: "Under 2 years" },
                ].map((item) => (
                  <div key={item.type} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.sub}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePassengerChange(item.type, "dec")}
                        disabled={item.type === "adults" && passengers.adults <= 1 || passengers[item.type as keyof typeof passengers] === 0}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-slate-900">
                        {passengers[item.type as keyof typeof passengers]}
                      </span>
                      <button
                         onClick={() => handlePassengerChange(item.type, "inc")}
                         className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-primary hover:bg-blue-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowPassengerDropdown(false)}
                className="w-full mt-4 bg-primary text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-slate-100 gap-4">
        <div className="flex gap-6">
           <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">Direct Flights Only</span>
           </label>
           <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
              <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">Refundable Fares</span>
           </label>
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
             {/* Airline Preference - Multi-select */}
             <div className="relative w-full sm:w-56" ref={airlineDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowAirlineDropdown(!showAirlineDropdown)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary flex items-center justify-between transition-colors hover:border-primary/50"
                >
                  <span className="truncate">
                    {selectedAirlines.length === 0
                      ? "Preferred Airline (Any)"
                      : selectedAirlines.length === 1
                      ? AIRLINES.find(a => a.code === selectedAirlines[0])?.name
                      : `${selectedAirlines.length} Airlines Selected`}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    arrow_drop_down
                  </span>
                </button>

                {showAirlineDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                    <div className="space-y-1">
                      {AIRLINES.map((airline) => {
                        const isSelected = selectedAirlines.includes(airline.code);
                        return (
                          <div
                            key={airline.code}
                            onClick={() => handleAirlineToggle(airline.code)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              isSelected ? "bg-primary border-primary" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && (
                                <span className="material-symbols-outlined text-white text-[14px] font-bold">
                                  check
                                </span>
                              )}
                            </div>
                            <span className={`text-sm font-medium ${
                              isSelected ? "text-primary" : "text-slate-700"
                            }`}>
                              {airline.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {selectedAirlines.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedAirlines([]);
                            setShowAirlineDropdown(false);
                          }}
                          className="w-full py-1.5 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}
             </div>

            <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
                {loading ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Searching...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">search</span>
                        Search Flights
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
