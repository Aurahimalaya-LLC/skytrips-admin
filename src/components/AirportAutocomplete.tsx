"use client";

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";

interface AirportRow {
  id: string;
  name: string | null;
  municipality: string | null;
  iata_code: string | null;
  iso_country: string | null;
  popularity: number | null;
}

interface AirportOption {
  name: string;
  city: string;
  country?: string;
  IATA: string;
}

interface AirportAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => void;
  disabled?: boolean;
  icon: string;
  className?: string;
}

const AirportAutocomplete = ({ label, name, value, onChange, disabled, icon, className }: AirportAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AirportOption[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = `${name}-listbox`;

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

    const runSearch = async () => {
      try {
        if (!value || value.trim().length < 1) {
          const { data, error } = await supabase
            .from("airports")
            .select("id,name,municipality,iata_code,iso_country,popularity")
            // .eq("published_status", true) // Removed to allow all airports
            .not("iata_code", "is", null)
            .order("popularity", { ascending: false })
            .limit(50);
          if (error) throw error;
          const options = (data || []).map((row: AirportRow) => ({
            name: row.name || "",
            city: row.municipality || "",
            country: row.iso_country || undefined,
            IATA: row.iata_code || "",
          }));
          setFilteredOptions(options);
        } else {
          const q = value.trim();
          const { data, error } = await supabase
            .from("airports")
            .select("id,name,municipality,iata_code,iso_country,popularity")
            .or(`municipality.ilike.%${q}%,name.ilike.%${q}%,iata_code.ilike.%${q}%`)
            // .eq("published_status", true) // Removed to allow all airports
            .limit(50);
          if (error) throw error;
          const options = (data || []).map((row: AirportRow) => ({
            name: row.name || "",
            city: row.municipality || "",
            country: row.iso_country || undefined,
            IATA: row.iata_code || "",
          }));
          setFilteredOptions(options);
        }
      } catch (e) {
        console.error("Airport search failed:", e);
        setFilteredOptions([]);
      }
    };

    const timer = setTimeout(runSearch, 200);
    return () => clearTimeout(timer);
  }, [value, isOpen]);

  const highlight = (text: string, query: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1 || !query) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        const option = filteredOptions[activeIndex];
        onChange({
          target: {
            name,
            value: `${option.name} (${option.IATA})`,
          },
        });
        setIsOpen(false);
        setActiveIndex(-1);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>
            {icon}
          </span>
        </div>
        <input
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          className={className || "block w-full h-12 pl-12 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"}
          name={name}
          placeholder="City or Airport"
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600"
            onClick={() => {
              onChange({ target: { name, value: "" } });
              setActiveIndex(-1);
              setIsOpen(false);
              setFilteredOptions([]);
            }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto"
        >
          {filteredOptions.map((option, index) => (
            <li
              role="option"
              aria-selected={activeIndex === index}
              key={`${option.IATA}-${index}`}
              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group ${activeIndex === index ? "bg-slate-50" : ""}`}
              onClick={() => {
                onChange({
                  target: {
                    name,
                    value: `${option.name} (${option.IATA})`,
                  },
                });
                setIsOpen(false);
                setActiveIndex(-1);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors break-words whitespace-normal">
                    {highlight(option.city || option.name, value)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 break-words whitespace-normal">
                    {highlight(option.name, value)}
                  </div>
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors shrink-0">
                  {highlight(option.IATA, value)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportAutocomplete;
