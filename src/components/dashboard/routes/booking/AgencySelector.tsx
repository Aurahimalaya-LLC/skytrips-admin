
"use client";

import { Agency, useAgencies } from "@/hooks/useAgencies";
import AgencyCheckboxList from "@/components/agency/AgencyCheckboxList";

interface AgencySelectorProps {
  airlineCode?: string;
  selectedAgencyId: string;
  onSelect: (agency: Agency) => void;
}

export default function AgencySelector({ airlineCode, selectedAgencyId, onSelect }: AgencySelectorProps) {
  // We fetch agencies inside AgencyCheckboxList, but we need the 'agencies' list here 
  // ONLY if we wanted to find the selected agency object by ID.
  // However, AgencyCheckboxList doesn't expose the agency objects back, only IDs.
  // But wait! AgencyCheckboxList is just UI. The logic for "onSelectionChange" gives us IDs.
  // We need to map ID -> Agency object to call onSelect(agency).
  
  // So we still need useAgencies here to lookup the object.
  const { agencies } = useAgencies();

  const handleSelectionChange = (ids: string[]) => {
    // This is a single selector logic
    if (ids.length > 0) {
      const newId = ids[ids.length - 1]; // Take the last selected
      const agency = agencies.find((a: Agency) => a.uid === newId);
      if (agency) {
        onSelect(agency);
      }
    } else {
       // Optional: Handle deselecting everything if needed
       // For now, we enforce at least one selection logic or just allow empty?
       // If empty, we might want to pass null, but onSelect expects Agency.
       // Let's assume we just don't call onSelect if empty, or we need to update the parent to handle null.
       // Looking at BookingSummary, it handles selectedAgency | null.
       // But onSelect type is (agency: Agency) => void.
       // We'll just ignore deselection for now or it effectively does nothing (keeps previous).
       // Actually, looking at AgencyCheckboxList, it allows toggling off.
       // If user toggles off the currently selected one, ids will be [].
    }
  };

  return (
    <div className="w-full">
      {/* 
        Render the list directly. 
        We use a fixed height container to ensure it fits within the UI 
        without taking up infinite space, while allowing scrolling.
      */}
      <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
         <AgencyCheckboxList 
           selectedIds={selectedAgencyId ? [selectedAgencyId] : []}
           onSelectionChange={handleSelectionChange}
           allowBulkSelection={false} // Single select mode
           airlineCode={airlineCode}
           className="h-full border-0 shadow-none rounded-none"
         />
      </div>
    </div>
  );
}
