"use client";

import { useState, useEffect } from "react";
import { AddReasonModal } from "@/components/AddReasonModal";
import { supabase } from "@/lib/supabase";
import { Reason } from "@/types";

export default function ReasonManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReason, setEditingReason] = useState<Reason | null>(null);
  const [stats, setStats] = useState({
    mostUsed: "Loading...",
    recentActivity: 0,
  });
  const [chartData, setChartData] = useState<
    { label: string; fullLabel: string; value: number; percentage: number }[]
  >([]);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);

  useEffect(() => {
    fetchReasons();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [dateRange]);

  const fetchStats = async (signal?: AbortSignal) => {
    try {
      // Calculate start date based on range
      let startDate: Date | null = new Date();
      if (dateRange === "7d") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === "30d") {
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateRange === "90d") {
        startDate.setDate(startDate.getDate() - 90);
      } else {
        startDate = null; // All time
      }

      // Base query
      let query = supabase
        .from("manage_booking")
        .select("uid", { count: "exact", head: true })
        .not("reason", "is", null);

      if (signal) {
        query = query.abortSignal(signal);
      }

      if (startDate) {
        query = query.gte("created_at", startDate.toISOString());
      }

      // Count all bookings created in selected range that have a reason
      const { count: activityCount, error: countError } = await query;

      if (countError) throw countError;

      // Fetch most used reason (analyze last 1000 records for performance within range)
      let reasonsQuery = supabase
        .from("manage_booking")
        .select("reason")
        .not("reason", "is", null)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (signal) {
        reasonsQuery = reasonsQuery.abortSignal(signal);
      }

      if (startDate) {
        reasonsQuery = reasonsQuery.gte("created_at", startDate.toISOString());
      }

      const { data: reasonsData, error: reasonsError } = await reasonsQuery;

      if (reasonsError) throw reasonsError;

      // Process reasons data
      const counts: Record<string, number> = {};
      (reasonsData || []).forEach((item) => {
        if (item.reason) {
          counts[item.reason] = (counts[item.reason] || 0) + 1;
        }
      });

      let mostUsed = "N/A";
      let maxCount = 0;

      Object.entries(counts).forEach(([reason, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsed = reason;
        }
      });

      setStats({
        mostUsed,
        recentActivity: activityCount || 0,
      });

      // Prepare Chart Data (Top 6)
      const sortedReasons = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

      const maxValue = sortedReasons.length > 0 ? sortedReasons[0][1] : 1;

      const newChartData = sortedReasons.map(([label, value]) => ({
        label: label.length > 10 ? label.substring(0, 10) + "..." : label,
        fullLabel: label,
        value,
        percentage: maxValue > 0 ? Math.round((value / maxValue) * 100) : 0,
      }));

      setChartData(newChartData);
    } catch (error) {
      if (
        (error as { name?: string }).name === "AbortError" ||
        (error as { code?: number }).code === 20
      ) {
        // Ignore abort errors
        return;
      }
      console.error("Error fetching stats:", error);
      // Only reset stats if it's a real error, not just an abort
      // setStats({ mostUsed: "N/A", recentActivity: 0 });
    }
  };

  const fetchReasons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reasons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReasons(data || []);
    } catch (error) {
      console.error("Error fetching reasons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReason = async (data: {
    title: string;
    description: string;
  }) => {
    try {
      if (editingReason) {
        // Update existing
        const { error } = await supabase
          .from("reasons")
          .update({ title: data.title, description: data.description })
          .eq("id", editingReason.id);

        if (error) throw error;
      } else {
        // Create new
        // Fetch existing codes to generate a sequential UID
        const { data: existingReasons, error: fetchError } = await supabase
          .from("reasons")
          .select("code");

        if (fetchError) throw fetchError;

        let nextNum = 1;
        if (existingReasons && existingReasons.length > 0) {
          const maxNum = existingReasons.reduce((max, r) => {
            const match = r.code.match(/REF-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              return num > max ? num : max;
            }
            return max;
          }, 0);
          nextNum = maxNum + 1;
        }

        const code = `REF-${nextNum.toString().padStart(3, "0")}`;

        const { error } = await supabase
          .from("reasons")
          .insert([{ code, title: data.title, description: data.description }]);

        if (error) throw error;
      }
      fetchReasons();
      setIsModalOpen(false);
      setEditingReason(null);
    } catch (error) {
      console.error("Error saving reason:", error);
      alert("Failed to save reason. Please try again.");
    }
  };

  const handleEdit = (reason: Reason) => {
    setEditingReason(reason);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this reason?")) {
      try {
        const { error } = await supabase.from("reasons").delete().eq("id", id);
        if (error) throw error;
        setReasons((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Error deleting reason:", error);
        alert("Failed to delete reason. Please try again.");
      }
    }
  };

  const handleAddNew = () => {
    setEditingReason(null);
    setIsModalOpen(true);
  };

  const filteredReasons = reasons.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12 space-y-8">
      <AddReasonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReason(null);
        }}
        onSubmit={handleSaveReason}
        initialData={
          editingReason
            ? {
                uid: editingReason.code,
                title: editingReason.title,
                description: editingReason.description,
              }
            : null
        }
      />

      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reason Management
          </h1>
          <p className="text-slate-500 mt-1">
            Configure standardized codes for refunds, reissues, and tour
            cancellations.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-teal-400 hover:bg-teal-500 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Reason
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              TOTAL REASONS DEFINED
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {reasons.length}
            </p>
          </div>
          <div className="size-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500">
            <span className="material-symbols-outlined">list</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              MOST USED REASON
            </p>
            <p className="text-3xl font-bold text-slate-900 truncate" title={stats.mostUsed}>
              {stats.mostUsed}
            </p>
          </div>
          <div className="size-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500 shrink-0">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              RECENT ACTIVITY COUNT
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {stats.recentActivity}
            </p>
          </div>
          <div className="size-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-500">
            <span className="material-symbols-outlined">analytics</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search and filter through all reasons..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto"></div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">
                  UID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-64">
                  TITLE
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-32">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading reasons...
                  </td>
                </tr>
              ) : filteredReasons.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No reasons found.
                  </td>
                </tr>
              ) : (
                filteredReasons.map((reason) => (
                  <tr
                    key={reason.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <span className="text-teal-500 font-bold text-sm bg-teal-50 px-2 py-1 rounded">
                        {reason.code}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">
                        {reason.title}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-500 text-sm">
                        {reason.description}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 transition-all">
                        <button
                          onClick={() => handleEdit(reason)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit reason"
                          aria-label={`Edit ${reason.title}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(reason.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete reason"
                          aria-label={`Delete ${reason.title}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {filteredReasons.length > 0 ? 1 : 0}-
              {Math.min(filteredReasons.length, 5)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {filteredReasons.length}
            </span>{" "}
            reasons
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Frequency Chart Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Frequency of Reasons
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Distribution of refund and reissue selections
              {dateRange === "7d"
                ? " (Last 7 days)"
                : dateRange === "30d"
                ? " (Last 30 days)"
                : dateRange === "90d"
                ? " (Last 90 days)"
                : " (All time)"}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors bg-white"
            >
              {dateRange === "7d"
                ? "Last 7 Days"
                : dateRange === "30d"
                ? "Last 30 Days"
                : dateRange === "90d"
                ? "Last 90 Days"
                : "All Time"}
              <span className="material-symbols-outlined text-[18px]">
                expand_more
              </span>
            </button>
            {isRangeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsRangeDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                  <button
                    onClick={() => {
                      setDateRange("7d");
                      setIsRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      dateRange === "7d"
                        ? "text-teal-600 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      setDateRange("30d");
                      setIsRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      dateRange === "30d"
                        ? "text-teal-600 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      setDateRange("90d");
                      setIsRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      dateRange === "90d"
                        ? "text-teal-600 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    Last 90 Days
                  </button>
                  <button
                    onClick={() => {
                      setDateRange("all");
                      setIsRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      dateRange === "all"
                        ? "text-teal-600 font-bold"
                        : "text-slate-700"
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart Placeholder Area */}
        <div className="h-64 w-full relative mt-4">
          <div className="absolute inset-0 flex items-end justify-between px-4 sm:px-12 pb-2">
            {chartData.length > 0 ? (
              chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 group w-1/6 relative"
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-800 text-white text-xs rounded py-1 px-2 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.fullLabel}: {item.value}
                  </div>

                  {/* Bar */}
                  <div className="w-full flex items-end justify-center h-48">
                    <div
                      className="w-8 sm:w-12 bg-teal-400 rounded-t-lg transition-all duration-500 hover:bg-teal-500 relative"
                      style={{ height: `${Math.max(item.percentage, 5)}%` }}
                    ></div>
                  </div>

                  {/* Label */}
                  <span
                    className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider text-center truncate w-full px-1"
                    title={item.fullLabel}
                  >
                    {item.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No data available for chart
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
