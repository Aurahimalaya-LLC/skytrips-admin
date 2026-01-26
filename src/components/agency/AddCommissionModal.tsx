
"use client";

import { useState, useEffect } from "react";

type CommissionType = "PERCENTAGE" | "FIXED";

interface AddCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function AddCommissionModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddCommissionModalProps) {
  const [airline, setAirline] = useState("");
  const [type, setType] = useState<CommissionType>("PERCENTAGE");
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Reset or load initial data
      if (initialData) {
        setAirline(initialData.airline || "");
        setType(initialData.type || "PERCENTAGE");
        setValue(initialData.value?.replace(/[^0-9.]/g, "") || "");
        setIsActive(initialData.status === "ACTIVE");
      } else {
        setAirline("");
        setType("PERCENTAGE");
        setValue("");
        setIsActive(true);
      }
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // Wait for animation
  };

  const handleSave = () => {
    onSave({
      airline,
      type,
      value: type === "PERCENTAGE" ? `${value}%` : `$${value}`,
      status: isActive ? "ACTIVE" : "INACTIVE",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-200 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Add/Edit Airline Commission
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure airline-specific commission rules for this agency.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Airline Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Airline
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search & Select Airline"
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-500 text-slate-900"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Commission Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Commission Type
            </label>
            <div className="grid grid-cols-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setType("PERCENTAGE")}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${
                  type === "PERCENTAGE"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Percentage
              </button>
              <button
                onClick={() => setType("FIXED")}
                className={`h-10 rounded-lg text-sm font-bold transition-all ${
                  type === "FIXED"
                    ? "bg-white text-primary shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Fixed Amount
              </button>
            </div>
          </div>

          {/* Value & Status */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-900"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 h-7 min-w-[28px] px-1.5 flex items-center justify-center bg-slate-200/50 rounded-md text-slate-500 font-bold text-xs">
                  {type === "PERCENTAGE" ? "%" : "$"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Status
              </label>
              <div className="h-12 flex items-center gap-3">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                    isActive ? "bg-[#2D8A76]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-bold text-slate-900">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#2D8A76] text-white font-bold text-sm hover:bg-[#257564] transition-colors shadow-lg shadow-[#2D8A76]/20"
          >
            Save Commission
          </button>
        </div>
      </div>
    </div>
  );
}
