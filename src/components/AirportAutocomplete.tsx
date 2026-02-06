"use client";

import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { RecentSearchItem } from "@/hooks/useRecentSearches";

interface AirportRow {
  id: string;
  name: string | null;
  municipality: string | null;
  iata_code: string | null;
  iso_country: string | null;
  popularity: number | null;
}

interface AirportOption {
  type: "airport";
  name: string;
  city: string;
  country?: string;
  IATA: string;
}

interface RecentSearchOption {
  type: "recent";
  item: RecentSearchItem;
}

type AutocompleteOption = AirportOption | RecentSearchOption;

interface AirportAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => void;
  disabled?: boolean;
  icon: string;
  recentSearches?: RecentSearchItem[];
  onSelectRecentSearch?: (item: RecentSearchItem) => void;
  onDeleteRecentSearch?: (id: string, e: React.MouseEvent) => void;
}

const AirportAutocomplete = ({ 
  label, 
  name, 
  value, 
  onChange, 
  disabled, 
  icon,
  recentSearches = [],
  onSelectRecentSearch,
  onDeleteRecentSearch
}: AirportAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
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
    // Re-calculate options when value, isOpen, or recentSearches changes
    if (!isOpen) return;

    const runSearch = async () => {
      let airportOptions: AirportOption[] = [];
      
      try {
        if (!value || value.trim().length < 1) {
          const { data, error } = await supabase
            .from("airports")
            .select("id,name,municipality,iata_code,iso_country,popularity")
            .eq("published_status", true)
            .not("iata_code", "is", null)
            .order("popularity", { ascending: false })
            .limit(10); // Limit to 10 for popular
          if (error) throw error;
          airportOptions = (data || []).map((row: AirportRow) => ({
            type: "airport",
            name: row.name || "",
            city: row.municipality || "",
            country: row.iso_country || undefined,
            IATA: row.iata_code || "",
          }));
        } else {
          const q = value.trim();
          const { data, error } = await supabase
            .from("airports")
            .select("id,name,municipality,iata_code,iso_country,popularity")
            .or(`municipality.ilike.%${q}%,name.ilike.%${q}%,iata_code.ilike.%${q}%`)
            .eq("published_status", true)
            .limit(50);
          if (error) throw error;
          airportOptions = (data || []).map((row: AirportRow) => ({
            type: "airport",
            name: row.name || "",
            city: row.municipality || "",
            country: row.iso_country || undefined,
            IATA: row.iata_code || "",
          }));
        }
      } catch (e) {
        console.error("Airport search failed:", e);
      }

      // Merge Recent Searches if input is empty
      let mergedOptions: AutocompleteOption[] = [];
      if ((!value || value.trim().length === 0) && recentSearches.length > 0) {
        const recents: RecentSearchOption[] = recentSearches.slice(0, 5).map(item => ({
          type: "recent",
          item
        }));
        mergedOptions = [...recents, ...airportOptions];
      } else {
        mergedOptions = airportOptions;
      }
      
      setFilteredOptions(mergedOptions);
    };

    const timer = setTimeout(runSearch, 200);
    return () => clearTimeout(timer);
  }, [value, isOpen, recentSearches]);

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
        if (option.type === "recent") {
           onSelectRecentSearch?.(option.item);
        } else {
           onChange({
            target: {
              name,
              value: `${option.name} (${option.IATA})`,
            },
          });
        }
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
          className="block w-full h-12 pl-12 pr-10 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
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
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-auto"
        >
          {filteredOptions.map((option, index) => {
            if (option.type === "recent") {
               const item = option.item;
               return (
                 <li
                    role="option"
                    aria-selected={activeIndex === index}
                    key={`recent-${item.id}`}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group flex justify-between items-center ${activeIndex === index ? "bg-slate-50" : ""}`}
                    onClick={() => {
                      onSelectRecentSearch?.(item);
                      setIsOpen(false);
                      setActiveIndex(-1);
                    }}
                 >
                   <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">history</span>
                      <div>
                         <p className="font-bold text-slate-900 text-sm">
                           {item.origin.split("(")[1]?.replace(")", "") || item.origin} <span className="text-slate-400 mx-1">→</span> {item.destination.split("(")[1]?.replace(")", "") || item.destination}
                         </p>
                         <p className="text-xs text-slate-500">
                           {item.departureDate} {item.returnDate ? `- ${item.returnDate}` : ""} • {item.passengers.adults + item.passengers.children + item.passengers.infants} Pax
                         </p>
                      </div>
                   </div>
                   {onDeleteRecentSearch && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           onDeleteRecentSearch(item.id, e);
                        }}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Delete recent search"
                     >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                     </button>
                   )}
                 </li>
               );
            }
            
            // Airport Option
            return (
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
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AirportAutocomplete;
