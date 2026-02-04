"use client";

interface InquiryFiltersProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onSearchChange: (search: string) => void;
}

export default function InquiryFilters({ activeTab, onTabChange, onSearchChange }: InquiryFiltersProps) {
    const tabs = ["All Inquiries", "Assigned to Me", "Urgent Only"];

    return (
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap ${
                            activeTab === tab
                                ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                : "text-slate-500 hover:text-slate-700"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search inquiries..."
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                </div>
                <button className="size-11 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/30 transition-all">
                    <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
            </div>
        </div>
    );
}
