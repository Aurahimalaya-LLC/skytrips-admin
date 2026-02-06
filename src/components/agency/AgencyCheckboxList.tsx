
"use client";

import { useAgencies } from "@/hooks/useAgencies";
import { useAirlineCommissions } from "@/hooks/useAirlineCommissions";

interface AgencyCheckboxListProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  className?: string;
  allowBulkSelection?: boolean;
  airlineCode?: string;
}

export default function AgencyCheckboxList({
  selectedIds,
  onSelectionChange,
  className = "",
  allowBulkSelection = true,
  airlineCode
}: AgencyCheckboxListProps) {
  const { agencies, loading: agenciesLoading, error: agenciesError } = useAgencies();
  const { commissions, loading: commissionsLoading, error: commissionsError } = useAirlineCommissions(airlineCode);
  
  // Search state removed as per request
  
  const loading = agenciesLoading || commissionsLoading;
  const error = agenciesError || commissionsError;

  // No filtering, just show all agencies
  const filteredAgencies = agencies;

  // Handlers
  const handleToggle = (uid: string) => {
    if (selectedIds.includes(uid)) {
      onSelectionChange(selectedIds.filter((id) => id !== uid));
    } else {
      onSelectionChange([...selectedIds, uid]);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredAgencies.map((a) => a.uid);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    
    if (allSelected) {
      onSelectionChange(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...allIds]));
      onSelectionChange(newIds);
    }
  };

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "inactive":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  // Helper to format date
  const formatDate = (dateStr: string) => {
      try {
          return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
          return dateStr;
      }
  };

  // Render
  return (
    <div className={`flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Select Agencies {airlineCode ? `for ${airlineCode}` : ''}
          </h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {selectedIds.length} selected
          </span>
        </div>

        {/* Search Input Removed */}

        {allowBulkSelection && !loading && !error && filteredAgencies.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="text-xs font-semibold text-[#0EA5E9] hover:text-[#0284C7] transition-colors flex items-center gap-1 w-fit"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              {filteredAgencies.every(a => selectedIds.includes(a.uid)) ? "deselect" : "select_all"}
            </span>
            {filteredAgencies.every(a => selectedIds.includes(a.uid)) ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-[200px] p-2 space-y-1 relative">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full space-y-3 py-8 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
            <span className="text-xs font-medium">Loading data...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full space-y-2 py-8 px-4 text-center">
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mb-1">
               <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
            </div>
            <p className="text-sm font-medium text-slate-800">Unable to load data</p>
            <p className="text-xs text-slate-500 max-w-[200px]">{error}</p>
          </div>
        )}

        {!loading && !error && filteredAgencies.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-slate-400">
            <span className="material-symbols-outlined text-3xl mb-2 opacity-50">search_off</span>
            <span className="text-sm">No agencies found</span>
          </div>
        )}

        {!loading && !error && filteredAgencies.map((agency) => {
          const isSelected = selectedIds.includes(agency.uid);
          const commission = commissions[agency.uid];
          
          return (
            <label
              key={agency.uid}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 group
                ${isSelected 
                  ? "bg-[#F0F9FF] border-[#BAE6FD]" 
                  : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                }
              `}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(agency.uid)}
                  className="w-4 h-4 text-[#0EA5E9] border-slate-300 rounded focus:ring-[#0EA5E9] cursor-pointer accent-[#0EA5E9]"
                  aria-label={`Select ${agency.agency_name}`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-sm font-semibold truncate ${isSelected ? "text-[#0284C7]" : "text-slate-700"}`}>
                    {agency.agency_name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider ${getStatusColor(agency.status)}`}>
                    {agency.status}
                  </span>
                </div>
                
                {/* Specific Airline Commission Display */}
                {commission ? (
                  <div className="mt-2 mb-2 p-2 bg-emerald-50 border border-emerald-100 rounded text-xs">
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                           <span className="material-symbols-outlined text-[14px]">flight</span>
                           {commission.airline_name} ({commission.airline_iata})
                        </span>
                        <span className="font-bold text-emerald-800 text-sm">
                           {commission.value}{commission.commission_type === 'PERCENTAGE' ? '%' : ''}
                        </span>
                     </div>
                     <div className="flex flex-wrap gap-2 text-[10px] text-emerald-600">
                        {commission.class_type && (
                            <span className="bg-white/50 px-1 rounded">Class: {commission.class_type}</span>
                        )}
                        {(commission.origin || commission.destination) && (
                            <span className="bg-white/50 px-1 rounded">
                                {commission.origin || 'Any'} → {commission.destination || 'Any'}
                            </span>
                        )}
                        <span className="ml-auto opacity-75">Updated: {formatDate(commission.updated_at)}</span>
                     </div>
                  </div>
                ) : airlineCode ? (
                    // Show warning if airline selected but no commission found
                   <div className="mt-1 mb-2 text-[10px] text-slate-400 italic flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">info</span>
                      No specific commission for {airlineCode}. Using default.
                   </div>
                ) : null}

                {/* Default/General Info */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                   {agency.iata_code && (
                     <span className="flex items-center gap-1" title="IATA Code">
                       <span className="material-symbols-outlined text-[14px] text-slate-400">flight</span>
                       <span className="font-mono">{agency.iata_code}</span>
                     </span>
                   )}
                   
                   {!commission && agency.commission_rate !== undefined && (
                     <span className="flex items-center gap-1" title="Default Commission Rate">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">percent</span>
                        <span className="font-medium">{agency.commission_rate}% (Default)</span>
                     </span>
                   )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      
      {/* Footer / Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
         <span>Total: {agencies.length}</span>
         <span>Showing: {filteredAgencies.length}</span>
      </div>
    </div>
  );
}
