"use client";

// import { useState } from "react";

interface PassengerFormProps {
  id: number;
  label: string;
  onRemove?: () => void;
  canRemove?: boolean;
}

export default function PassengerForm({ id, label, onRemove, canRemove }: PassengerFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            id === 1 ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-500"
          }`}>
            <span className="material-symbols-outlined text-[20px]">
              {id === 1 ? "person" : "person_add"}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-900">{label}</h3>
        </div>
        
        {canRemove && (
          <button 
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
          >
            Remove
            <span className="material-symbols-outlined text-[16px]">remove_circle</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label htmlFor={`fname-${id}`} className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">First Name</label>
          <input 
            type="text" 
            id={`fname-${id}`}
            placeholder={id === 1 ? "John" : "Jane"}
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label htmlFor={`lname-${id}`} className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Last Name</label>
          <input 
            type="text" 
            id={`lname-${id}`}
            placeholder="Doe"
            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      {id === 2 && (
        <p className="text-xs font-medium text-primary mt-4 italic">
          * Please ensure names match the passenger&apos;s valid government-issued ID.
        </p>
      )}
    </div>
  );
}
