
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export type CommissionType = "PERCENTAGE" | "FIXED";

interface Airport {
  id: string | number;
  name: string;
  iata_code: string;
  city: string;
  country: string;
}

interface AirportDBRow {
  id: string | number;
  name: string;
  iata_code: string;
  city: string | null;
  country: string | null;
}

interface Airline {
  id: number;
  name: string;
  iata_code: string;
  logo_url: string;
}

export interface CommissionData {
  id?: string;
  airline: string;
  airline_iata?: string;
  airline_logo?: string;
  type: CommissionType;
  value: string;
  rawValue?: number;
  status: "ACTIVE" | "INACTIVE";
  classType: string;
  origin: string;
  destination: string;
}

interface AddCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CommissionData) => void;
  initialData?: Partial<CommissionData>;
}

export default function AddCommissionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddCommissionModalProps) {
  const [airline, setAirline] = useState("");
  const [airlineIata, setAirlineIata] = useState("");
  const [airlineLogo, setAirlineLogo] = useState("");
  const [type, setType] = useState<CommissionType>("PERCENTAGE");
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [classType, setClassType] = useState("All");
  
  // Multi-value state for Origin & Destination
  const [origins, setOrigins] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  
  const [isClosing, setIsClosing] = useState(false);
  
  // Airline Search State
  const [searchResults, setSearchResults] = useState<Airline[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Airport Search State
  const [originResults, setOriginResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const originDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (originDropdownRef.current && !originDropdownRef.current.contains(event.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch airlines when typing
  useEffect(() => {
    const fetchAirlines = async () => {
      if (!airline || airline.length < 2) {
        setSearchResults([]);
        return;
      }

      // If the current airline value matches one of the results exactly, don't search
      // This prevents searching again after selection
      // However, we want to allow searching if the user modifies it. 
      // We'll control this by checking if the dropdown is supposed to be shown?
      // Or simply: we always search on type, but if we select, we might close dropdown.
      
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('airlines')
          .select('id, name, iata_code, logo_url')
          .ilike('name', `%${airline}%`)
          .limit(5);
        
        if (error) throw error;
        setSearchResults(data || []);
        if (!showDropdown && document.activeElement === document.querySelector('input[placeholder="Search & Select Airline"]')) {
           setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error fetching airlines:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchAirlines, 300);
    return () => clearTimeout(timer);
  }, [airline]);

  // Fetch Origin Airports
  useEffect(() => {
    const fetchOriginAirports = async () => {
      if (!originInput || originInput.length < 2) {
        setOriginResults([]);
        return;
      }
      setIsSearchingOrigin(true);
      try {
        const { data, error } = await supabase
          .from('airports')
          .select('id, name, iata_code, city, country')
          .or(`name.ilike.%${originInput}%,iata_code.ilike.%${originInput}%,city.ilike.%${originInput}%`)
          .limit(5);
        
        if (error) throw error;
        
        const mappedResults: Airport[] = (data || []).map((item: AirportDBRow) => ({
          id: item.id,
          name: item.name,
          iata_code: item.iata_code,
          city: item.city || "",
          country: item.country || ""
        }));
        
        setOriginResults(mappedResults);
        if (!showOriginDropdown) setShowOriginDropdown(true);
      } catch (err) {
        console.error('Error fetching origin airports:', err);
      } finally {
        setIsSearchingOrigin(false);
      }
    };

    const timer = setTimeout(fetchOriginAirports, 300);
    return () => clearTimeout(timer);
  }, [originInput]);

  // Fetch Destination Airports
  useEffect(() => {
    const fetchDestinationAirports = async () => {
      if (!destinationInput || destinationInput.length < 2) {
        setDestinationResults([]);
        return;
      }
      setIsSearchingDestination(true);
      try {
        const { data, error } = await supabase
          .from('airports')
          .select('id, name, iata_code, city, country')
          .or(`name.ilike.%${destinationInput}%,iata_code.ilike.%${destinationInput}%,city.ilike.%${destinationInput}%`)
          .limit(5);
        
        if (error) throw error;
        
        const mappedResults: Airport[] = (data || []).map((item: AirportDBRow) => ({
          id: item.id,
          name: item.name,
          iata_code: item.iata_code,
          city: item.city || "",
          country: item.country || ""
        }));
        
        setDestinationResults(mappedResults);
        if (!showDestinationDropdown) setShowDestinationDropdown(true);
      } catch (err) {
        console.error('Error fetching destination airports:', err);
      } finally {
        setIsSearchingDestination(false);
      }
    };

    const timer = setTimeout(fetchDestinationAirports, 300);
    return () => clearTimeout(timer);
  }, [destinationInput]);

  // Handle selection from dropdown
  const handleSelectOrigin = (airport: Airport) => {
    if (airport.iata_code && !origins.includes(airport.iata_code)) {
      setOrigins([...origins, airport.iata_code]);
    }
    setOriginInput("");
    setShowOriginDropdown(false);
  };

  const handleSelectDestination = (airport: Airport) => {
    if (airport.iata_code && !destinations.includes(airport.iata_code)) {
      setDestinations([...destinations, airport.iata_code]);
    }
    setDestinationInput("");
    setShowDestinationDropdown(false);
  };

  // Handle adding/removing tags
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    setValue: (val: string) => void,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = value.trim().toUpperCase();
      if (trimmed && !list.includes(trimmed)) {
        setList([...list, trimmed]);
        setValue("");
      }
    } else if (e.key === "Backspace" && !value && list.length > 0) {
      setList(list.slice(0, -1));
    }
  };

  const removeTag = (tag: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.filter((t) => t !== tag));
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Reset or load initial data
      if (initialData) {
        setAirline(initialData.airline || "");
        setAirlineIata(initialData.airline_iata || "");
        setAirlineLogo(initialData.airline_logo || "");
        setType(initialData.type || "PERCENTAGE");
        // If rawValue exists, use it, otherwise try to parse value
        const val = initialData.rawValue?.toString() || initialData.value?.replace(/[^0-9.]/g, "") || "";
        setValue(val);
        setIsActive(initialData.status === "ACTIVE");
        setClassType(initialData.classType || "All");
        
        // Parse comma-separated strings into arrays
        setOrigins(initialData.origin ? initialData.origin.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
        setDestinations(initialData.destination ? initialData.destination.split(",").map((s: string) => s.trim()).filter(Boolean) : []);
      } else {
        setAirline("");
        setType("PERCENTAGE");
        setValue("");
        setIsActive(true);
        setClassType("All");
        setOrigins([]);
        setDestinations([]);
        setOriginInput("");
        setDestinationInput("");
      }
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // Wait for animation
  };

  const handleSave = () => {
    onSave({
      airline,
      airline_iata: airlineIata,
      airline_logo: airlineLogo,
      type,
      value: type === "PERCENTAGE" ? `${value}%` : `$${value}`,
      rawValue: parseFloat(value),
      status: isActive ? "ACTIVE" : "INACTIVE",
      classType,
      origin: origins.join(","),
      destination: destinations.join(","),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add/Edit Airline Commission
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure airline-specific commission rules for this agency.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Airline Selection */}
          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Airline
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search & Select Airline"
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-500 text-slate-900"
                value={airline}
                onChange={(e) => {
                  setAirline(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>

              {/* Dropdown Results */}
              {showDropdown && airline.length >= 2 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul className="py-2">
                      {searchResults.map((result) => (
                        <li
                          key={result.id}
                          onClick={() => {
                            setAirline(result.name);
                            setAirlineIata(result.iata_code);
                            setAirlineLogo(result.logo_url);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                            {result.logo_url ? (
                              <img
                                src={result.logo_url}
                                alt={result.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-lg">
                                flight
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              {result.name}
                            </span>
                            {result.iata_code && (
                              <span className="text-xs font-medium text-slate-500">
                                IATA: {result.iata_code}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No airlines found matching &quot;{airline}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Commission Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Commission Type
            </label>
            <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setType("PERCENTAGE")}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${
                  type === "PERCENTAGE"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Percentage
              </button>
              <button
                onClick={() => setType("FIXED")}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${
                  type === "FIXED"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Fixed Amount
              </button>
            </div>
          </div>

          {/* Class Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Class Type
            </label>
            <div className="relative">
              <select
                value={classType}
                onChange={(e) => setClassType(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 appearance-none"
              >
                <option value="All">All Classes</option>
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2" ref={originDropdownRef}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Origin
              </label>
              <div className="relative">
                <div className="w-full min-h-[48px] px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all flex flex-wrap gap-2 items-center">
                  {origins.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs font-bold"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag, origins, setOrigins)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={origins.length === 0 ? "e.g. LHR, JFK" : ""}
                    className="flex-1 bg-transparent border-none outline-none min-w-[60px] h-8 text-slate-900 placeholder:text-slate-400"
                    value={originInput}
                    onChange={(e) => {
                      setOriginInput(e.target.value);
                      if (e.target.value.length >= 2) setShowOriginDropdown(true);
                    }}
                    onFocus={() => {
                      if (originInput.length >= 2) setShowOriginDropdown(true);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, originInput, setOriginInput, origins, setOrigins)}
                  />
                </div>

                {/* Origin Dropdown Results */}
                {showOriginDropdown && originInput.length >= 2 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {isSearchingOrigin ? (
                      <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : originResults.length > 0 ? (
                      <ul className="py-2">
                        {originResults.map((result) => (
                          <li
                            key={result.id}
                            onClick={() => handleSelectOrigin(result)}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                <span className="material-symbols-outlined text-slate-400 text-lg">
                                  flight_takeoff
                                </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">
                                {result.name} ({result.iata_code})
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {result.city}, {result.country}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No airports found matching &quot;{originInput}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2" ref={destinationDropdownRef}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Destination
              </label>
              <div className="relative">
                <div className="w-full min-h-[48px] px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all flex flex-wrap gap-2 items-center">
                  {destinations.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs font-bold"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag, destinations, setDestinations)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={destinations.length === 0 ? "e.g. LHR, JFK" : ""}
                    className="flex-1 bg-transparent border-none outline-none min-w-[60px] h-8 text-slate-900 placeholder:text-slate-400"
                    value={destinationInput}
                    onChange={(e) => {
                      setDestinationInput(e.target.value);
                      if (e.target.value.length >= 2) setShowDestinationDropdown(true);
                    }}
                    onFocus={() => {
                      if (destinationInput.length >= 2) setShowDestinationDropdown(true);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, destinationInput, setDestinationInput, destinations, setDestinations)}
                  />
                </div>

                {/* Destination Dropdown Results */}
                {showDestinationDropdown && destinationInput.length >= 2 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {isSearchingDestination ? (
                      <div className="p-4 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    ) : destinationResults.length > 0 ? (
                      <ul className="py-2">
                        {destinationResults.map((result) => (
                          <li
                            key={result.id}
                            onClick={() => handleSelectDestination(result)}
                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                <span className="material-symbols-outlined text-slate-400 text-lg">
                                  flight_land
                                </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">
                                {result.name} ({result.iata_code})
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {result.city}, {result.country}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        No airports found matching &quot;{destinationInput}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Value & Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-900"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-7 min-w-[28px] px-1.5 flex items-center justify-center bg-slate-200/50 rounded-md text-slate-500 font-bold text-xs">
                  {type === "PERCENTAGE" ? "%" : "$"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Status
              </label>
              <div className="h-12 flex items-center gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                    isActive ? "bg-[#2D8A76]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-slate-900">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#2D8A76] text-white font-bold text-sm hover:bg-[#257564] transition-colors shadow-lg shadow-[#2D8A76]/20"
          >
            Save Commission
          </button>
        </div>
      </div>
    </div>
  );
}
