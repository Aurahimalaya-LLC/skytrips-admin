"use client";

import { useState, useRef } from "react";
import InquiryKanbanBoard from "@/components/dashboard/inquiry-crm/InquiryKanbanBoard";
import CreateInquiryModal from "@/components/dashboard/inquiry-crm/CreateInquiryModal";
import ImportPNRModal from "@/components/dashboard/inquiry-crm/ImportPNRModal";

export default function InquiryCRMPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const boardRef = useRef<{ fetchInquiries: () => void }>(null);

    const handleImportPNR = (pnrDataString: string) => {
        try {
            const pnrData = JSON.parse(pnrDataString);
            console.log("Importing PNR Data:", pnrData);
            
            // In a real implementation, you would trigger a server action 
            // or API call to create the inquiry record in the DB here.
            // For now, we'll show success.
            
            alert(`Successfully processed PNR: ${pnrData.pnr_number}\n\nPassengers: ${pnrData.passengers.join(", ")}\n\nSegments: ${pnrData.segments.length}`);
            
            // Refresh board to show new data if it was added
            if (boardRef.current) {
                boardRef.current.fetchInquiries();
            }
        } catch (e) {
            console.error("Failed to parse imported PNR data", e);
            alert("Error processing PNR data");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-8 min-h-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Inquiry CRM Board</h1>
                    <p className="text-slate-500 font-bold">Drag and drop inquiries to update their status in the lifecycle.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:border-primary/30 hover:text-primary transition-all flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">code</span>
                        Import PNR
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-3.5 bg-primary text-white rounded-2xl text-xs font-black shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create New Inquiry
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <InquiryKanbanBoard />

            {/* Create Modal */}
            <CreateInquiryModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSuccess={() => {
                    // Refresh the board
                    window.location.reload(); // Simple refresh for now
                }}
            />

            {/* Import PNR Modal */}
            <ImportPNRModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportPNR}
            />
        </div>
    );
}
