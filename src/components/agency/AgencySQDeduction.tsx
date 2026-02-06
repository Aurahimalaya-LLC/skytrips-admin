
"use client";

import { useAgencyDeductions } from "@/hooks/useAgencyDeductions";
import { useState } from "react";

interface AgencySQDeductionProps {
  agencyUid: string | null | undefined;
  className?: string;
}

export default function AgencySQDeduction({ agencyUid, className = "" }: AgencySQDeductionProps) {
  const { deductions, totalDeducted, loading, error } = useAgencyDeductions(agencyUid, 'SQ');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!agencyUid) return null;

  if (loading) {
    return <span className={`text-slate-400 text-xs animate-pulse ${className}`}>Calculating...</span>;
  }

  if (error) {
    return <span className={`text-red-400 text-xs ${className}`}>Error</span>;
  }

  if (deductions.length === 0) {
      return <span className={`text-slate-400 text-xs ${className}`}>None</span>;
  }

  return (
    <div className={`flex flex-col items-end ${className}`}>
      {/* Total Amount Trigger */}
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 group cursor-pointer hover:bg-slate-50 px-1.5 py-0.5 rounded transition-colors"
        aria-expanded={isExpanded}
        aria-controls="deduction-breakdown"
      >
        <span 
          className="font-bold text-slate-700"
          aria-label={`Total deducted amount: AUD ${totalDeducted.toFixed(2)}`}
        >
          AUD {totalDeducted.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className={`material-symbols-outlined text-[14px] text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Itemized Breakdown */}
      {isExpanded && (
        <div 
          id="deduction-breakdown"
          className="mt-2 w-full min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200 z-10"
        >
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Itemized Deductions</span>
             <span className="text-[10px] font-bold text-slate-700">SQ</span>
          </div>
          <div className="divide-y divide-slate-50 max-h-[200px] overflow-y-auto">
            {deductions.map((deduction) => (
              <div key={deduction.id} className="px-3 py-2 flex justify-between items-start hover:bg-[#F8FAFC] transition-colors group">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-700">{deduction.description || "Unspecified Deduction"}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(deduction.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className="text-xs font-bold text-red-500 group-hover:text-red-600">
                  - AUD {Number(deduction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-600">Total Deducted</span>
             <span className="text-xs font-black text-slate-800">
               AUD {totalDeducted.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </span>
          </div>
        </div>
      )}
    </div>
  );
}
