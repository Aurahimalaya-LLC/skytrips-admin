"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Traveller } from "@/types";

interface TravellerSearchProps {
  onSelect: (traveller: any) => void;
  className?: string;
}

export default function TravellerSearch({ onSelect, className = "" }: TravellerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
    const searchTravellers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("travellers")
          .select("*")
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,passport_number.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Error searching travellers:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchTravellers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
        </div>
        <input
          type="text"
          className="block w-full h-10 rounded-lg border-slate-200 pl-10 focus:border-primary focus:ring focus:ring-primary/10 sm:text-sm"
          placeholder="Search traveller by name or passport..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((traveller) => (
            <li
              key={traveller.id}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none transition-colors"
              onClick={() => {
                onSelect(traveller);
                setQuery(`${traveller.first_name} ${traveller.last_name}`);
                setIsOpen(false);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {traveller.first_name} {traveller.last_name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{traveller.nationality}</div>
                </div>
                <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  {traveller.passport_number}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-center text-sm text-slate-500">
          No travellers found matching "{query}"
        </div>
      )}
    </div>
  );
}
