"use client";

import { useState, useRef } from "react";
import InquiryKanbanBoard from "@/components/dashboard/inquiry-crm/InquiryKanbanBoard";
import CreateInquiryModal from "@/components/dashboard/inquiry-crm/CreateInquiryModal";

export default function InquiryCRMPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const boardRef = useRef<{ fetchInquiries: () => void }>(null);

    return (
        <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-8 min-h-full">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Inquiry CRM Board</h1>
                    <p className="text-slate-500 font-bold">Drag and drop inquiries to update their status in the lifecycle.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:border-primary/30 hover:text-primary transition-all flex items-center gap-2 group">
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
        </div>
    );
}
