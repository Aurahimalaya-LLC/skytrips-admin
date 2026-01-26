"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types";

export default function ServiceDetailsPage() {
  const params = useParams();
  const [service, setService] = useState<Service | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchService(params.id as string);
    }
  }, [params.id]);

  const fetchService = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err) {
      console.error("Error fetching service:", err);
      setError("Failed to load service details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-7xl mx-auto w-full font-display">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-xl flex items-center justify-between">
          <span>{error || "Service not found"}</span>
          <Link href="/dashboard/services" className="font-bold hover:underline">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      {/* Breadcrumbs */}
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li>
            <Link href="/dashboard/services" className="hover:text-primary transition-colors">
              Services
            </Link>
          </li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li className="font-medium text-primary">Details</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
                service.type === "Meal" ? "bg-orange-100 text-orange-600" :
                service.type === "Insurance" ? "bg-purple-100 text-purple-600" :
                service.type === "Transfer" ? "bg-blue-100 text-blue-600" :
                "bg-slate-100 text-slate-600"
            }`}>
                <span className="material-symbols-outlined text-[32px]">
                    {service.type === "Meal" ? "restaurant" :
                     service.type === "Insurance" ? "security" :
                     service.type === "Transfer" ? "directions_car" :
                     "inventory_2"}
                </span>
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{service.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Service Details
                </p>
            </div>
        </div>
        <div className="flex gap-3">
            <Link
                href="/dashboard/services"
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors border border-border bg-background"
            >
                Back to List
            </Link>
            <Link 
                href={`/dashboard/services/${service.id}/edit`}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Service
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20">
                    <h3 className="font-bold text-foreground">General Information</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">Service Type</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {service.type}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.status 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}>
                                {service.status ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">Pricing Type</span>
                            <span className="font-medium text-foreground">{service.pricing_type}</span>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground block mb-1">Base Price</span>
                            <span className="font-bold text-xl text-foreground">${Number(service.base_price).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Meal Options Display */}
                    {service.type === "Meal" && service.options && service.options.length > 0 && (
                        <div className="pt-4 border-t border-border">
                            <span className="text-sm text-muted-foreground block mb-3">Meal Options / Add-ons</span>
                            <div className="bg-background rounded-lg border border-border overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-4 py-2">Option Name</th>
                                            <th className="px-4 py-2 text-right">Additional Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {service.options.map((option, index) => (
                                            <tr key={index} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-4 py-2 font-medium text-foreground">{option.name}</td>
                                                <td className="px-4 py-2 text-right font-mono text-foreground">
                                                    +${Number(option.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border">
                        <span className="text-sm text-muted-foreground block mb-1">Description</span>
                        <p className="text-foreground whitespace-pre-wrap">
                            {service.description || "No description provided."}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar / Meta Info */}
        <div className="space-y-6">
             <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20">
                    <h3 className="font-bold text-foreground">Metadata</h3>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono text-foreground text-xs">{service.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Created At</span>
                        <span className="text-foreground">
                            {service.created_at ? new Date(service.created_at).toLocaleDateString() : "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="text-foreground">
                            {service.updated_at ? new Date(service.updated_at).toLocaleDateString() : "N/A"}
                        </span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
