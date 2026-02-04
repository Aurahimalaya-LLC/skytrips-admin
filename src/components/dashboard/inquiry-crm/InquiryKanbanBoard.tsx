"use client";

import { useState, useEffect, useCallback } from "react";
import { FlightInquiry, InquiryStatus } from "@/types/inquiry";
import InquiryColumn from "./InquiryColumn";
import InquiryFilters from "./InquiryFilters";
import InquiryStats from "./InquiryStats";

export default function InquiryKanbanBoard() {
    const [inquiries, setInquiries] = useState<FlightInquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All Inquiries");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchInquiries = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (activeTab === "Assigned to Me") params.append("assignedToMe", "true");
            if (activeTab === "Urgent Only") params.append("priority", "HIGH");
            if (searchQuery) params.append("search", searchQuery);

            const response = await fetch(`/api/inquiries?${params.toString()}`);
            const result = await response.json();
            if (result.success) {
                setInquiries(result.data);
            }
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, searchQuery]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("inquiryId", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = async (e: React.DragEvent, newStatus: InquiryStatus) => {
        const id = e.dataTransfer.getData("inquiryId");
        if (!id) return;

        // Optimistic update
        const updatedInquiries = inquiries.map(inq => 
            inq.id === id ? { ...inq, status: newStatus } : inq
        );
        setInquiries(updatedInquiries);

        try {
            const response = await fetch(`/api/inquiries/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await response.json();
            if (!result.success) {
                // Rollback if failed
                fetchInquiries();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            fetchInquiries();
        }
    };

    const columns: { title: string; status: InquiryStatus; color: string }[] = [
        { title: "New Inquiries", status: "NEW", color: "bg-blue-500" },
        { title: "Processing", status: "PROCESSING", color: "bg-amber-500" },
        { title: "Quote Sent", status: "QUOTE_SENT", color: "bg-purple-500" },
        { title: "Follow-up", status: "FOLLOW_UP", color: "bg-indigo-400" },
    ];

    return (
        <div className="flex flex-col h-full">
            <InquiryFilters 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onSearchChange={setSearchQuery} 
            />

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <div className="flex gap-6 h-full min-w-[1200px] pb-6">
                    {columns.map((col) => (
                        <InquiryColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            color={col.color}
                            inquiries={inquiries.filter(inq => inq.status === col.status)}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))}
                </div>
            </div>

            <InquiryStats />
        </div>
    );
}
