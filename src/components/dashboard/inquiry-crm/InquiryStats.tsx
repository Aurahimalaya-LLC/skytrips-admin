"use client";

export default function InquiryStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-slate-100">
            {/* Stat 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Boards</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-slate-900">7 Active</p>
                        <span className="text-[11px] font-bold text-teal-500">+2 ↑</span>
                    </div>
                </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue Status</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-slate-900">Normal</p>
                        <span className="text-[11px] font-bold text-teal-500">Healthy</span>
                    </div>
                </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Response Time</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-slate-900">1.4h</p>
                        <span className="text-[11px] font-bold text-teal-500">-10m ↓</span>
                    </div>
                </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Velocity</p>
                    <p className="text-sm font-black text-slate-900">68%</p>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[68%] transition-all duration-500" />
                </div>
            </div>
        </div>
    );
}
