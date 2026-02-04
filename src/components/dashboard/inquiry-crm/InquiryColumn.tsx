"use client";

import { FlightInquiry, InquiryStatus } from "@/types/inquiry";
import InquiryCard from "./InquiryCard";

interface InquiryColumnProps {
    title: string;
    status: InquiryStatus;
    inquiries: FlightInquiry[];
    color: string;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, status: InquiryStatus) => void;
}

export default function InquiryColumn({ title, status, inquiries, color, onDragStart, onDrop }: InquiryColumnProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-slate-50/50');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('bg-slate-50/50');
    };

    const handleOnDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-slate-50/50');
        onDrop(e, status);
    };

    return (
        <div 
            className="flex-1 min-w-[300px] h-full transition-all duration-200 rounded-2xl p-2"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleOnDrop}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${color}`} />
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {title}
                    </h2>
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                        {inquiries.length}
                    </span>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
            </div>

            <div className="flex flex-col gap-1 h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar px-2">
                {inquiries.length > 0 ? (
                    inquiries.map((inquiry) => (
                        <InquiryCard 
                            key={inquiry.id} 
                            inquiry={inquiry} 
                            onDragStart={onDragStart}
                        />
                    ))
                ) : (
                    <div className="h-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300 gap-2">
                        <span className="text-[11px] font-black uppercase tracking-widest">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    );
}
