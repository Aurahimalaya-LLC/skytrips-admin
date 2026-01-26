
"use client";

import { useState, useRef, useEffect } from "react";

export type DateRange = {
  from: Date | null;
  to: Date | null;
  label: string;
};

interface DateRangeFilterProps {
  onRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

const PRESETS = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "This Year", days: 365 }, // Simplified
];

export default function DateRangeFilter({
  onRangeChange,
  initialRange,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(
    initialRange || {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
      label: "Last 30 Days",
    }
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetClick = (days: number, label: string) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    const newRange = { from, to, label };
    setRange(newRange);
    onRangeChange(newRange);
    setIsOpen(false);
  };

  const handleCustomDateChange = (type: "from" | "to", value: string) => {
    if (!value) return;
    const date = new Date(value);
    
    const newRange = { ...range, [type]: date, label: "Custom Range" };
    setRange(newRange);
    
    // Only trigger change if both dates are valid
    if (newRange.from && newRange.to) {
        onRangeChange(newRange);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatInputDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">
          calendar_today
        </span>
        {formatDate(range.from)} - {formatDate(range.to)}
        <span className={`material-symbols-outlined text-[18px] transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1 border-b border-slate-100">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.days, preset.label)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  range.label === preset.label
                    ? "bg-primary/5 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="p-4 space-y-3 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Custom Range
            </div>
            <div className="space-y-2">
                <div>
                    <label className="text-xs text-slate-500 font-medium ml-1">From</label>
                    <input
                        type="date"
                        value={formatInputDate(range.from)}
                        onChange={(e) => handleCustomDateChange("from", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 font-medium ml-1">To</label>
                    <input
                        type="date"
                        value={formatInputDate(range.to)}
                        onChange={(e) => handleCustomDateChange("to", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
                    />
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
