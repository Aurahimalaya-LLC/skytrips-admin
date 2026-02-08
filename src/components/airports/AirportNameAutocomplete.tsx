"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Airport } from "@/types/airport";

interface AirportNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AirportNameAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  className,
  required 
}: AirportNameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || value.length < 2) {
      if (value.length < 2) setOptions([]);
      return;
    }

    const fetchAirports = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/airports?search=${encodeURIComponent(value)}&limit=10`);
        const result = await res.json();

        if (result.success && result.data) {
          const mappedAirports: Airport[] = result.data.map((row: any) => ({
            id: row.id,
            iata_code: row.iata_code,
            name: row.name,
            city: row.city || "",
            country: row.country || "",
            latitude: row.latitude || null,
            longitude: row.longitude || null,
            timezone: row.timezone || null,
            active: row.published_status ?? true,
          }));
          setOptions(mappedAirports);
        }
      } catch (err) {
        console.error("Error fetching airports by name:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAirports, 300);
    return () => clearTimeout(timer);
  }, [value, isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        id="name"
        name="name"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        required={required}
      />
      
      {isOpen && (options.length > 0 || loading) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {loading && options.length === 0 && (
            <li className="px-4 py-2 text-sm text-slate-500 italic">Loading...</li>
          )}
          {options.map((airport) => (
            <li
              key={airport.id}
              onClick={() => {
                onSelect(airport);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
            >
              <div className="font-medium">{airport.name}</div>
              <div className="text-xs text-slate-500">
                {airport.iata_code} • {airport.city}, {airport.country}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
