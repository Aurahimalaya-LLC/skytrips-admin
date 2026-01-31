"use client";

// import { useState } from "react";

interface PassengerFormProps {
  id: number;
  label: string;
  onRemove?: () => void;
  canRemove?: boolean;
}

import countries from "@/data/countries.json";

export default function PassengerForm({ id, label, onRemove, canRemove }: PassengerFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-display">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            !canRemove ? "bg-blue-50 text-[#0EA5E9]" : "bg-slate-100 text-slate-500"
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {!canRemove ? "person" : "person_add"}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{label}</h3>
        </div>
        
        {canRemove && (
          <button 
            onClick={onRemove}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            Remove
            <span className="material-symbols-outlined text-[16px]">remove_circle</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor={`fname-${id}`} className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id={`fname-${id}`}
            required
            placeholder={id === 1 ? "John" : "Jane"}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor={`lname-${id}`} className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id={`lname-${id}`}
            required
            placeholder="Doe"
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Removed: Gender, DOB, Country, Passport Fields as per request */}
      </div>
    </div>
  );
}
