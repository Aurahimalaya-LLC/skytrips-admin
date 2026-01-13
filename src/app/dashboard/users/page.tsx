"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

export default function UsersPage() {
  const [data, setData] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to load users");
      setData(j.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [q, page]);

  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li className="font-medium text-primary">Users</li>
        </ol>
      </nav>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
        <Link
          href="/dashboard/admin#settings"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New User</span>
        </Link>
      </div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search by name, username, or email"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {error && (
          <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6">
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="size-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
                      Loading…
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-slate-500">No users found</td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-900">{u.username}</td>
                    <td className="px-6 py-3 text-slate-700">{u.email}</td>
                    <td className="px-6 py-3 text-slate-700">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "-"}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold">{u.role || "user"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.status === "active" ? "bg-green-50 text-green-700" :
                        u.status === "inactive" ? "bg-amber-50 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{u.status || "unknown"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/users/${u.id}`} className="text-primary hover:underline text-sm font-bold inline-flex items-center gap-1">
                        View
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            Prev
          </button>
          <div className="text-sm font-bold text-slate-900">Page {page}</div>
          <button
            disabled={loading || data.length < pageSize}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
