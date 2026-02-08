"use client";

import { useState, useEffect, useRef } from "react";

interface AirportOption {
  id: number | string;
  iata_code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export const AirportSelect = ({
  label,
  value,
  onChange,
  disabled,
  placeholder = "Search airport...",
  required,
  name,
}: AirportSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize searchTerm with value if present
  useEffect(() => {
    if (value && !searchTerm && !isOpen) {
        // Optionally fetch the full airport details if we want to show the name instead of just the code
        // For now, we'll just show the code or let the user type
        setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If closed and no valid selection matches input, reset to value (simple validation)
        if (value && searchTerm !== value) {
            setSearchTerm(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, searchTerm]);

  useEffect(() => {
    if (!isOpen || !searchTerm || searchTerm.length < 2) return;

    const fetchAirports = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/airports?search=${searchTerm}`);
        if (!response.ok) {
            console.error("Failed to fetch airports");
            return;
        }
        const result = await response.json();
        // v1/airports returns { success: true, data: [...], meta: ... }
        // So we need result.data
        setOptions(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error("Error fetching airports:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAirports, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  const handleSelect = (airport: AirportOption) => {
    onChange(airport.iata_code);
    setSearchTerm(airport.iata_code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value.toUpperCase());
            setIsOpen(true);
            // If user clears input, clear value
            if (e.target.value === "") {
                onChange("");
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {loading ? (
             <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
          ) : (
             <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">
              {loading ? "Searching..." : "No airports found"}
            </div>
          ) : (
            <ul className="py-1">
              {options.map((airport) => (
                <li
                  key={airport.id}
                  onClick={() => handleSelect(airport)}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 w-12">{airport.iata_code}</span>
                    <span className="text-sm text-slate-600 truncate flex-1 mx-2">
                      {airport.city}, {airport.name}
                    </span>
                    <span className="text-xs text-slate-400">{airport.country}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
