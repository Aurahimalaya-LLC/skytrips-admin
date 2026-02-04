"use client";

import { FlightInquiry } from "@/types/inquiry";
import { formatDistanceToNow } from "date-fns";

interface InquiryCardProps {
    inquiry: FlightInquiry;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

export default function InquiryCard({ inquiry, onDragStart }: InquiryCardProps) {
    const priorityColors = {
        HIGH: "bg-red-50 text-red-600",
        MEDIUM: "bg-amber-50 text-amber-600",
        LOW: "bg-emerald-50 text-emerald-600",
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, inquiry.id)}
            className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-4"
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {inquiry.inquiry_number}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${priorityColors[inquiry.priority]}`}>
                    {inquiry.priority}
                </span>
            </div>

            <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-primary transition-colors">
                {inquiry.client_name}
            </h3>

            <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-700">{inquiry.departure_code}</span>
                <span className="material-symbols-outlined text-[14px] text-slate-300">arrow_forward</span>
                <span className="text-xs font-bold text-slate-700">{inquiry.arrival_code}</span>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_today</span>
                <span className="text-[11px] font-bold text-slate-500">
                    {new Date(inquiry.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(inquiry.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {/* Avatar placeholder */}
                        <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">John Doe</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
}
