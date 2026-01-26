"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Stats (calculated from fetched data for now, or could be separate queries)
  const [stats, setStats] = useState({
    total: 0,
    activeInsurance: 0,
    activeTransfers: 0,
    otherAddons: 0
  });

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchTerm]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Base query
      let query = supabase
        .from("services")
        .select("*", { count: "exact" });

      // Search filter
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error: fetchError } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      setServices(data || []);
      setTotalCount(count || 0);

      // Fetch Stats (separate query to get full counts, ignoring pagination)
      const { data: allData, error: statsError } = await supabase.from("services").select("type, status");
      
      if (statsError) {
          console.warn("Error fetching stats:", statsError);
      }
      
      if (allData) {
        setStats({
          total: allData.length,
          activeInsurance: allData.filter(s => s.type === "Insurance" && s.status).length,
          activeTransfers: allData.filter(s => s.type === "Transfer" && s.status).length,
          otherAddons: allData.filter(s => !["Insurance", "Transfer"].includes(s.type)).length
        });
      }

    } catch (err: unknown) {
      console.error("Error fetching services:", err);
      // Check if it's a specific Supabase error (like missing table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseError = err as any;
      if (supabaseError?.code === '42P01') { // undefined_table
         setError("The 'services' table does not exist. Please run the migration file.");
      } else {
         setError("Failed to load services. " + (supabaseError?.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
      fetchServices(); // Refresh list
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service.");
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ status: !service.status })
        .eq("id", service.id);
      
      if (error) throw error;
      
      // Optimistic update
      setServices(services.map(s => s.id === service.id ? { ...s, status: !s.status } : s));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto w-full font-display space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Travel Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage insurance, airport transfers, meals, and other travel add-ons.
          </p>
        </div>
        <Link 
          href="/dashboard/services/create"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Services */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Total Services</span>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">inventory_2</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.total}</span>
            <span className="text-xs font-medium text-green-500 mb-1">↗ 8%</span>
          </div>
        </div>

        {/* Card 2: Active Insurance */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Active Insurance</span>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <span className="material-symbols-outlined text-purple-500 text-[20px]">security</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.activeInsurance}</span>
            <span className="text-xs font-medium text-muted-foreground mb-1">Stable</span>
          </div>
        </div>

        {/* Card 3: Active Transfers */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Active Transfers</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <span className="material-symbols-outlined text-indigo-500 text-[20px]">directions_car</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.activeTransfers}</span>
            <span className="text-xs font-medium text-green-500 mb-1">↗ 15%</span>
          </div>
        </div>

        {/* Card 4: Other Add-ons */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-muted-foreground">Other Add-ons</span>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <span className="material-symbols-outlined text-orange-500 text-[20px]">extension</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.otherAddons}</span>
            <span className="text-xs font-medium text-red-500 mb-1">↘ 3%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20">
            <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
                <input 
                    type="text" 
                    placeholder="Search services..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* Can add filters here later */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Pricing Type</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                        Loading services...
                    </div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No services found. Try adjusting your search or add a new service.
                    </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            service.type === 'Insurance' ? 'bg-purple-500/10 text-purple-500' :
                            service.type === 'Transfer' ? 'bg-indigo-500/10 text-indigo-500' :
                            service.type === 'Meal' ? 'bg-green-500/10 text-green-500' :
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {service.type === 'Insurance' ? 'medical_services' :
                             service.type === 'Transfer' ? 'directions_car' :
                             service.type === 'Meal' ? 'restaurant' :
                             'cases'}
                          </span>
                        </div>
                        <Link 
                          href={`/dashboard/services/${service.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {service.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.type === 'Primary Service' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {service.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {service.pricing_type}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      ${Number(service.base_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                        <button 
                            onClick={() => handleToggleStatus(service)}
                            className="flex items-center gap-2 focus:outline-none group/toggle"
                        >
                             <div className={`w-9 h-5 rounded-full relative transition-colors ${service.status ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${service.status ? 'left-5' : 'left-1'}`}></div>
                             </div>
                             <span className={`text-xs font-medium ${service.status ? 'text-green-600' : 'text-slate-500'}`}>
                                {service.status ? 'Active' : 'Inactive'}
                             </span>
                        </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/dashboard/services/${service.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        <Link 
                          href={`/dashboard/services/${service.id}/edit`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                        <button 
                          onClick={() => service.id && handleDelete(service.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
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
        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{services.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium text-foreground">{totalCount}</span> results
            </span>
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple pagination logic showing first 5 pages or context around current
                    // For simplicity, just showing 1..N or sliding window could be added
                    let p = i + 1;
                    if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                    if (p > totalPages) return null;
                    
                    return (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                currentPage === p 
                                ? 'bg-primary text-primary-foreground' 
                                : 'border border-border bg-background hover:bg-muted'
                            }`}
                        >
                            {p}
                        </button>
                    );
                })}
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
