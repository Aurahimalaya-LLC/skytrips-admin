"use client";
import { useEffect, useState } from "react";
import { InviteUserModal } from "@/components/InviteUserModal";
import { supabase } from "@/lib/supabase";
import { EmailEventType } from "@/types/email-event";

type UserRow = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  avatar_key?: string;
  last_login_at?: string | null;
};

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
      if (q) {
        query = query.or(`email.ilike.*${q}*,first_name.ilike.*${q}*,last_name.ilike.*${q}*,phone.ilike.*${q}*`);
      }
      if (roleFilter) {
        query = query.eq("role", roleFilter);
      }
      if (statusFilter) {
        query = query.eq("is_active", statusFilter === "active");
      }
      if (verifiedFilter) {
        query = query.eq("is_verified", verifiedFilter === "verified");
      }
      const { data: rows, count, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      const normalized = (rows || []).map((u: UserRow) => {
        const username = u.first_name ? u.first_name : (u.email?.split("@")[0] || "");
        const roleKey = u.role || "";
        const roleDisplay = roleKey
          ? roleKey.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
          : "";
        return {
          ...u,
          username,
          role: roleDisplay,
          role_key: roleKey,
          status: u.is_active ? "active" : "inactive",
          last_login: u.last_login_at || "",
          displayId: `#USR-${String(u.id).substring(0, 4)}`
        };
      });
      setData(normalized);
      setTotalCount(count || 0);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch users";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [q, page, roleFilter, statusFilter, verifiedFilter]);
  useEffect(() => {
    const channel = supabase
      .channel("public:users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(totalCount / pageSize);
  const getPageButtons = (current: number, total: number) => {
    const result: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) result.push(i);
      return result;
    }
    result.push(1);
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) result.push("...");
    for (let i = start; i <= end; i++) result.push(i);
    if (end < total - 1) result.push("...");
    result.push(total);
    return result;
  };
  const pageButtons = getPageButtons(page, totalPages);

  const handleInviteUser = async (payload: any) => {
    const fullName: string = payload?.fullName || "";
    const email: string = (payload?.email || "").trim();
    const role: string = payload?.role || "agent";
    const parts = fullName.trim().split(" ");
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ") || "";
    if (!email) {
      setError("Email is required");
      return;
    }
    if (payload?.id) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ email, first_name, last_name, role })
        .eq("id", payload.id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { count: existingCount, error: existsError } = await supabase
        .from("users")
        .select("id", { count: "exact" })
        .eq("email", email);
      if (existsError) {
        setError(existsError.message);
        return;
      }
      if ((existingCount || 0) > 0) {
        setError("Email already exists");
        return;
      }
      const id = crypto.randomUUID();
      const { error: insertError } = await supabase.from("users").insert([
        { id, email, first_name, last_name, role, is_active: true, is_verified: false }
      ]);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      try {
        const payload = {
          type: EmailEventType.UserCreated,
          data: { email, fullName, role }
        };
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch {}
    }
    fetchData();
    setIsInviteModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-display pb-12">
      <InviteUserModal 
        isOpen={isInviteModalOpen} 
        onClose={() => {
          setIsInviteModalOpen(false);
          setEditingUser(null);
        }}
        onInvite={handleInviteUser}
        initialData={
          editingUser
            ? {
                id: editingUser.id,
                fullName: [editingUser.first_name, editingUser.last_name].filter(Boolean).join(" "),
                email: editingUser.email,
                role: editingUser.role_key || "agent"
              }
            : undefined
        }
        title={editingUser ? "Edit User" : "Invite New User"}
        submitLabel={editingUser ? "Save Changes" : "Send Invitation"}
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage internal access levels and staff credentials.</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-700 bg-white hover:bg-teal-50 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Invite New User
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {error && (
          <div className="px-6 py-4 bg-red-50 text-red-700 border-b border-red-200">{error}</div>
        )}
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                  placeholder="Search name, email, phone"
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
                  type="text"
                />
              </div>
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setPage(1);
                  setRoleFilter(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setPage(1);
                  setVerifiedFilter(e.target.value);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors bg-white"
              >
                <option value="">All Verification</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={() => {
                setQ("");
                setRoleFilter("");
                setStatusFilter("");
                setVerifiedFilter("");
                setPage(1);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Reset filters
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 font-bold uppercase text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 font-bold tracking-wider">User</th>
                <th className="px-6 py-5 font-bold tracking-wider">Email Address</th>
                <th className="px-6 py-5 font-bold tracking-wider">Role</th>
                <th className="px-6 py-5 font-bold tracking-wider">Status</th>
                <th className="px-6 py-5 font-bold tracking-wider">Verified</th>
                <th className="px-6 py-5 font-bold tracking-wider">Last Login</th>
                <th className="px-6 py-5 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <div className="flex items-center justify-center gap-3 text-slate-600">
                      <span className="size-5 border-2 border-slate-300 border-t-teal-600 rounded-full animate-spin"></span>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                data.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* User Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {u.first_name?.[0] || u.username[0] || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {[u.first_name, u.last_name].filter(Boolean).join(" ") || u.username}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">
                            ID: {`${u.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Email Column */}
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {u.email}
                    </td>
                    
                    {/* Role Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        u.role_key === "super_admin" 
                          ? "bg-teal-50 text-teal-700 border border-teal-100" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${
                          u.status === "active" ? "bg-green-500" : "bg-slate-300"
                        }`}></span>
                        <span className={`text-sm font-bold ${
                          u.status === "active" ? "text-slate-700" : "text-slate-400"
                        }`}>
                          {u.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    
                    {/* Verified Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${
                          u.is_verified ? "bg-teal-600" : "bg-slate-300"
                        }`}></span>
                        <span className={`text-sm font-bold ${
                          u.is_verified ? "text-slate-700" : "text-slate-400"
                        }`}>
                          {u.is_verified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </td>
                    
                    {/* Last Login Column */}
                    <td className="px-6 py-4 text-slate-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setIsInviteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(u);
                            setDeleteOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {deleteOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteOpen(false);
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-red-600">warning</span>
                <h2 id="delete-title" className="text-lg font-bold text-slate-900">
                  Confirm Deletion
                </h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="text-sm text-slate-700">
                  User: <span className="font-medium">{[deleteTarget?.first_name, deleteTarget?.last_name].filter(Boolean).join(" ") || deleteTarget?.email}</span>
                </div>
                <p className="text-xs text-red-600">
                  This action cannot be undone. The user will be permanently deleted.
                </p>
              </div>
              <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => setDeleteOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!deleteTarget) return;
                    setIsDeleting(true);
                    const { error: delError } = await supabase.from("users").delete().eq("id", deleteTarget.id);
                    setIsDeleting(false);
                    if (delError) {
                      setError(delError.message);
                    }
                    setDeleteOpen(false);
                    setDeleteTarget(null);
                    fetchData();
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting && <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            {totalCount === 0 ? (
              <>Showing <span className="font-bold text-slate-900">0</span> of <span className="font-bold text-slate-900">0</span> users</>
            ) : (
              <>Showing <span className="font-bold text-slate-900">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)}</span> of <span className="font-bold text-slate-900">{totalCount}</span> users</>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1 || totalPages <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {pageButtons.map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && setPage(Math.min(Math.max(1, p), totalPages))}
                disabled={typeof p !== "number" || totalPages <= 1}
                className={`size-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  p === page
                    ? "bg-teal-700 text-white shadow-sm"
                    : typeof p === "number"
                    ? "text-slate-600 hover:bg-slate-50"
                    : "text-slate-400 cursor-default"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= totalPages || totalPages <= 1}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
