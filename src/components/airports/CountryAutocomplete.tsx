"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CountryAutocomplete({ value, onChange, placeholder, className }: CountryAutocompleteProps) {
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

    const fetchCountries = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("airports")
          .select("country")
          .not("country", "is", null)
          .ilike("country", `%${value}%`)
          .limit(20);

        if (error) throw error;

        // Extract unique countries
        const uniqueCountries = Array.from(new Set((data || []).map(item => item.country))) as string[];
        setOptions(uniqueCountries);
      } catch (err) {
        console.error("Error fetching countries:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCountries, 300);
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
          {options.map((country) => (
            <li
              key={country}
              onClick={() => {
                onChange(country);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
