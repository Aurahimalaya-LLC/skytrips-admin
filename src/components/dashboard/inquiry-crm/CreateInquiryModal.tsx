"use client";

import { useState } from "react";
import { InquiryPriority, InquiryStatus } from "@/types/inquiry";

interface CreateInquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateInquiryModal({ isOpen, onClose, onSuccess }: CreateInquiryModalProps) {
    const [formData, setFormData] = useState({
        inquiry_number: "",
        client_name: "",
        departure_code: "",
        arrival_code: "",
        start_date: "",
        end_date: "",
        priority: "MEDIUM" as InquiryPriority,
        status: "NEW" as InquiryStatus,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error creating inquiry:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New Inquiry</h2>
                    <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all">
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Inquiry ID</label>
                            <input
                                required
                                type="text"
                                placeholder="#IF-9000"
                                value={formData.inquiry_number}
                                onChange={(e) => setFormData({ ...formData, inquiry_number: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                            <input
                                required
                                type="text"
                                placeholder="Client name"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Departure Code</label>
                            <input
                                required
                                type="text"
                                maxLength={3}
                                placeholder="LHR"
                                value={formData.departure_code}
                                onChange={(e) => setFormData({ ...formData, departure_code: e.target.value.toUpperCase() })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Arrival Code</label>
                            <input
                                required
                                type="text"
                                maxLength={3}
                                placeholder="JFK"
                                value={formData.arrival_code}
                                onChange={(e) => setFormData({ ...formData, arrival_code: e.target.value.toUpperCase() })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                            <input
                                required
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                            <input
                                required
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as InquiryPriority })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                            >
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as InquiryStatus })}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
                            >
                                <option value="NEW">New Inquiry</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="QUOTE_SENT">Quote Sent</option>
                                <option value="FOLLOW_UP">Follow-up</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] px-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isSubmitting ? "Creating..." : "Create Inquiry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
