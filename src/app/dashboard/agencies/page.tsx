"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Agency = {
  uid: string;
  agency_name: string;
  contact_person: string;
  number: string;
  status: string;
  stats?: {
    bookings: number;
    revenue: number;
    change: number;
  };
};

export default function AgenciesPage() {
  const [data, setData] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortKey, setSortKey] = useState("agency_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Global stats state
  const [globalStats, setGlobalStats] = useState({
    totalPartners: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalDueAmount: 0,
    activeBookings: 0
  });

  const fetchGlobalStats = async () => {
    try {
      const res = await fetch("/api/agencies/stats");
      const j = await res.json();
      if (res.ok) {
        setGlobalStats(j);
      }
    } catch (e) {
      console.error("Failed to fetch global stats:", e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        q,
        status,
        sortKey,
        sortDir,
      });
      const res = await fetch(`/api/agencies?${params.toString()}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load agencies");
      setData(j.data || []);
      setTotalCount(j.count || 0);
      setTotalPages(Math.ceil((j.count || 0) / pageSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []); // Fetch global stats once on mount

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
  }, [page, pageSize, q, status, sortKey, sortDir]);

  const onSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const suggestions = useMemo(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return data.filter((d) => d.agency_name.toLowerCase().includes(lower)).slice(0, 5);
  }, [q, data]);

  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Agencies Management</h1>
        <p className="text-slate-500 text-lg">A directory of all partner travel agencies globally.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-slate-100 relative group">
          <div className="size-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-2xl">group</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              TOTAL PARTNERS
              <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Total number of active agency partners">help</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{globalStats.totalPartners.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-slate-100 relative group">
          <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              TOTAL REVENUE
              <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Aggregate sum of all CP (Cost Price) costs">help</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {globalStats.totalRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-slate-100 relative group">
          <div className="size-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-2xl">confirmation_number</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              TOTAL BOOKINGS
              <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Aggregate sum of all agency bookings">help</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{globalStats.totalBookings.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-slate-100 relative group">
          <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              TOTAL DUE AMOUNT
              <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Sum of all outstanding payments">help</span>
            </div>
            <div className={`text-2xl font-bold ${globalStats.totalDueAmount > 10000 ? 'text-red-600' : 'text-slate-900'}`}>
              {globalStats.totalDueAmount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1"></div> {/* Spacer if needed, or move search here later */}
        <Link
          href="/dashboard/agencies/create"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-800 transition-all transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New Agency</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search agencies"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-sm">
              <ul>
                {suggestions.map((s) => (
                  <li key={s.uid}>
                    <button
                      onClick={() => setQ(s.agency_name)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                    >
                      {s.agency_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {error && <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-6 py-4 cursor-pointer" onClick={() => onSort("agency_name")}>AGENCY NAME</th>
                <th className="px-6 py-4">TOTAL BOOKINGS</th>
                <th className="px-6 py-4">CP AMOUNT</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="size-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
                      Loading…
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-slate-500">No agencies found</td>
                </tr>
              ) : (
                data.map((a, i) => {
                  const stats = a.stats || { bookings: 0, revenue: 0, change: 0 };
                  return (
                    <tr key={a.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link href={`/dashboard/agencies/${a.uid}`} className="text-slate-900 font-bold hover:text-primary transition-colors block text-base">{a.agency_name}</Link>
                          <div className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wide">ID: {a.uid.slice(0, 8).toUpperCase()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-bold">{stats.bookings.toLocaleString()}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stats.change >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                            {stats.change > 0 ? "+" : ""}{stats.change}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-bold">
                          ${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/agencies/${a.uid}/edit`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete agency?")) return;
                              const res = await fetch(`/api/agencies/${a.uid}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "soft" }) });
                              if (res.ok) {
                                fetchData();
                                fetchGlobalStats();
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500 w-full sm:w-auto text-center sm:text-left">
            Showing <span className="font-medium text-slate-900">{data.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-medium text-slate-900">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium text-slate-900">{totalCount}</span> agencies
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1; // Simplified pagination logic for visual match
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`size-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                      page === p ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-slate-400 px-1">...</span>}
              {totalPages > 5 && (
                 <button
                   onClick={() => setPage(totalPages)}
                   className={`size-8 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                     page === totalPages ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                   }`}
                 >
                   {totalPages}
                 </button>
              )}
            </div>
            <button
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
