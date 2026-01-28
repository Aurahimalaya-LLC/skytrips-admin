"use client";

import { useState, useEffect, useRef } from "react";
import airlineData from "../../libs/shared-utils/constants/airline.json";

interface Airline {
  name: string;
  iata?: string;
  icao?: string;
  country?: string;
}

interface AirlineAutocompleteProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  icon: string;
}

const AirlineAutocomplete = ({ label, name, value, onChange, onSelect, disabled, icon }: AirlineAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Airline[]>([]);
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
    if (isOpen) {
      const airlines = (airlineData as any).airlinecodes as Airline[];
      if (!value) {
        setFilteredOptions(airlines.slice(0, 50));
      } else {
        const lower = value.toLowerCase();
        const filtered = airlines.filter(
          (a) =>
            (a.name && a.name.toLowerCase().includes(lower)) ||
            (a.iata && a.iata.toLowerCase().includes(lower))
        );
        setFilteredOptions(filtered.slice(0, 50));
      }
    }
  }, [value, isOpen]);

  const highlight = (text: string, query: string) => {
    if (!text) return "";
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            value: `${option.name}`,
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
          className="block w-full h-12 pl-12 rounded-lg border-slate-200 shadow-sm focus:border-primary focus:ring focus:ring-primary/10 transition-all sm:text-sm font-medium"
          name={name}
          placeholder="Airline Name"
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
              key={index}
              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none group ${activeIndex === index ? "bg-slate-50" : ""}`}
              onClick={() => {
                onChange({
                  target: {
                    name,
                    value: `${option.name}`,
                  },
                });
                setIsOpen(false);
                setActiveIndex(-1);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">
                    {highlight(option.name, value)}
                  </div>
                </div>
                {option.iata && option.iata !== '-' && (
                  <div className="bg-slate-100 px-2 py-1 rounded text-xs font-black text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                    {highlight(option.iata, value)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirlineAutocomplete;
