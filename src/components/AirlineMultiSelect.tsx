"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Airline {
  id: string;
  name: string;
  iata_code: string;
  country: string;
}

interface AirlineMultiSelectProps {
  label?: string;
  value: Airline[];
  onChange: (value: Airline[]) => void;
  disabled?: boolean;
  placeholder?: string;
  excludeIds?: string[]; // IDs to exclude from search results (e.g. current airline)
}

export const AirlineMultiSelect = ({
  label,
  value,
  onChange,
  disabled,
  placeholder = "Select airlines...",
  excludeIds = [],
}: AirlineMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const fetchAirlines = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("airlines")
          .select("id, name, iata_code, country")
          .eq("status", "Active")
          .limit(20);

        if (searchTerm) {
          query = query.ilike("name", `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter out already selected airlines and excluded IDs
        const selectedIds = new Set(value.map(a => a.id));
        const excludeIdSet = new Set(excludeIds);
        
        const filteredOptions = (data || []).filter(
          airline => !selectedIds.has(airline.id) && !excludeIdSet.has(airline.id)
        );

        setOptions(filteredOptions);
      } catch (err) {
        console.error("Error fetching airlines:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchAirlines, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, value, excludeIds]);

  const handleSelect = (airline: Airline) => {
    onChange([...value, airline]);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleRemove = (airlineId: string) => {
    onChange(value.filter(a => a.id !== airlineId));
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      
      <div 
        className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all min-h-[46px] flex flex-wrap gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {value.map((airline) => (
          <div 
            key={airline.id}
            className="flex items-center gap-1.5 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm group"
          >
            <span>{airline.name}</span>
            <span className="text-gray-500 text-xs">({airline.iata_code})</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(airline.id);
              }}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
        
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-600 h-full py-1.5"
            placeholder={value.length === 0 ? placeholder : ""}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
          ) : options.length > 0 ? (
            <ul className="py-1">
              {options.map((airline) => (
                <li
                  key={airline.id}
                  onClick={() => handleSelect(airline)}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">{airline.name}</span>
                    <span className="text-gray-400 text-xs">{airline.country}</span>
                  </div>
                  <span className="text-xs font-mono bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded group-hover:bg-gray-800">
                    {airline.iata_code}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchTerm ? "No airlines found" : "Type to search airlines"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
