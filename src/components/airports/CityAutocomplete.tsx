"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({ value, onChange, placeholder, className }: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
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
    if (!isOpen) return;

    const fetchCities = async () => {
      if (!value) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/airports?search=${encodeURIComponent(value)}&limit=20`);
        const result = await res.json();

        if (result.success && result.data) {
          // Extract unique city names from the response
          const uniqueCities = Array.from(new Set(result.data.map((item: any) => item.city || item.municipality))) as string[];
          setOptions(uniqueCities.filter(Boolean));
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [value, isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (options.length > 0 || loading) && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {loading && options.length === 0 && (
            <li className="px-4 py-2 text-sm text-slate-500 italic">Loading...</li>
          )}
          {options.map((city) => (
            <li
              key={city}
              onClick={() => {
                onChange(city);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
