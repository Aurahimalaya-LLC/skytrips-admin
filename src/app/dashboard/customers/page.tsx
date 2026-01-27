"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import CustomerForm from "@/components/CustomerForm";
import CustomerRowMenu from "@/components/CustomerRowMenu";
// Import functionality removed

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Import state removed
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | 'name' | 'totalMiles' | 'totalSpend' | 'lastLogin'; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'asc' });
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("customers")
        .select("*", { count: "exact" });

      // Only apply server-side sorting for existing DB columns
      if (['id', 'firstName', 'lastName', 'email', 'created_at', 'isActive'].includes(sortConfig.key as string) || sortConfig.key === 'name') {
          if (sortConfig.key === 'name') {
              query = query.order('firstName', { ascending: sortConfig.direction === 'asc' });
          } else {
              query = query.order(sortConfig.key as string, { ascending: sortConfig.direction === 'asc' });
          }
      }
        
      query = query.range(from, to);

      if (debouncedSearch) {
        query = query.or(`firstName.ilike.*${debouncedSearch}*,lastName.ilike.*${debouncedSearch}*,email.ilike.*${debouncedSearch}*,phone.ilike.*${debouncedSearch}*`);
      }

      const { data, count, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const baseData: Customer[] = (data || []).map((customer: any) => ({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        dateOfBirth: customer.dateOfBirth,
        gender: customer.gender,
        userType: customer.userType,
        isActive: customer.isActive,
        country: customer.country,
        address: customer.address,
        phoneCountryCode: customer.phoneCountryCode,
        isDisabled: customer.isDisabled,
        isVerified: customer.isVerified,
        passport: customer.passport,
        socialProvider: customer.socialProvider,
        socialId: customer.socialId,
        referralCode: customer.referralCode,
        created_at: customer.created_at || customer.createdAt,
        totalMiles: 0,
        totalSpend: 0,
        lastLogin: undefined,
      }));

      const ids = baseData.map((c) => String(c.id || "")).filter(Boolean);
      let metrics: Record<string, { totalSpend: number; lastLogin: string | null }> = {};
      if (ids.length > 0) {
        const res = await fetch("/api/customers/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok) {
          metrics = (json?.metrics || {}) as Record<
            string,
            { totalSpend: number; lastLogin: string | null }
          >;
        } else {
          console.error("Failed to fetch customer metrics", json?.error);
        }
      }

      const enrichedData: Customer[] = baseData.map((c) => {
        const key = String(c.id || "");
        const m = metrics[key];
        return {
          ...c,
          totalSpend: m?.totalSpend ?? 0,
          lastLogin: m?.lastLogin ?? undefined,
        };
      });

      // Client-side sorting for new metrics
      if (['totalMiles', 'totalSpend', 'lastLogin'].includes(sortConfig.key as string)) {
          enrichedData.sort((a: Customer, b: Customer) => {
              const aValue = a[sortConfig.key as keyof Customer];
              const bValue = b[sortConfig.key as keyof Customer];
              
              if (aValue === undefined || bValue === undefined) return 0;
              
              if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
              if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }

      setCustomers(enrichedData);
      setTotalCount(count || 0);
    } catch (err: unknown) {
      console.error("Fetch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const channel = supabase
      .channel("public:customers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => {
          fetchCustomers();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomers]);

  const handleSort = (key: keyof Customer | 'name' | 'totalMiles' | 'totalSpend' | 'lastLogin') => {
      setSortConfig(curr => ({ key, direction: curr.key === key && curr.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const renderSortIcon = (key: keyof Customer | 'name' | 'totalMiles' | 'totalSpend' | 'lastLogin') => {
      if (sortConfig.key !== key) return <span className="material-symbols-outlined text-[16px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">unfold_more</span>;
      return <span className="material-symbols-outlined text-[16px] text-primary">{sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    const ok = confirm("Are you sure you want to delete this customer?");
    if (!ok) return;

    const { error: deleteError } = await supabase
      .from("customers")
      .delete()
      .eq("id", customerId);

    if (deleteError) {
      alert(deleteError.message || "Failed to delete customer");
      return;
    }

    fetchCustomers();
  };

  const getStatusBadge = (isActive: string | boolean) => {
    const activeStr = typeof isActive === "boolean" ? (isActive ? "true" : "false") : isActive;
    if (activeStr === "true" || activeStr === "Active") {
      return (
        <span className="inline-flex items-center rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-medium text-success">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 font-display">
            Loading customers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      {/* Breadcrumbs */}
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </li>
          <li className="font-medium text-primary">Customers</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your user base, view details and travel history.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add Customer</span>
        </button>
        {/* Import buttons removed */}
      </div>

      {/* Filters and Search Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            search
          </span>
          <input
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Search by name, email, or phone..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="w-full sm:w-48 rounded-lg border border-border bg-card py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              filter_list
            </span>
            <span className="hidden sm:inline">More Filters</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-destructive mt-0.5">
              error
            </span>
            <div>
              <h3 className="text-destructive font-semibold mb-1">
                Error Loading Customers
              </h3>
              <p className="text-destructive text-sm">{error}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={fetchCustomers}
                  className="text-sm bg-destructive text-destructive-foreground px-4 py-2 rounded hover:bg-destructive/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table Card */}
      <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-bold uppercase tracking-wider text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4 w-12 text-center align-middle">
                  <input
                    className="rounded border-border text-primary focus:ring-primary bg-card"
                    type="checkbox"
                  />
                </th>
                <th 
                    className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors group select-none"
                    onClick={() => handleSort('name')}
                >
                    <div className="flex items-center gap-1">
                        Customer
                        {renderSortIcon('name')}
                    </div>
                </th>
                <th 
                    className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors group select-none"
                    onClick={() => handleSort('totalMiles')}
                >
                    <div className="flex items-center gap-1">
                        Total Miles
                        {renderSortIcon('totalMiles')}
                    </div>
                </th>
                <th 
                    className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors group select-none"
                    onClick={() => handleSort('totalSpend')}
                >
                    <div className="flex items-center gap-1">
                        Total Spend
                        {renderSortIcon('totalSpend')}
                    </div>
                </th>
                <th 
                    className="px-6 py-4 cursor-pointer hover:bg-muted transition-colors group select-none"
                    onClick={() => handleSort('lastLogin')}
                >
                    <div className="flex items-center gap-1">
                        Last Login
                        {renderSortIcon('lastLogin')}
                    </div>
                </th>
                <th 
                    className="px-6 py-4 text-center cursor-pointer hover:bg-muted transition-colors group select-none"
                    onClick={() => handleSort('isActive')}
                >
                    <div className="flex items-center justify-center gap-1">
                        Status
                        {renderSortIcon('isActive')}
                    </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-center align-middle">
                    <input
                      className="rounded border-border text-primary focus:ring-primary bg-card"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/customers/${customer.id}`}>
                      <div className="font-bold text-foreground text-sm hover:text-primary transition-colors cursor-pointer">
                        {customer.firstName} {customer.lastName}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                        {customer.totalMiles?.toLocaleString()} <span className="text-muted-foreground text-xs">mi</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                        ${customer.totalSpend?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                        {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {customer.lastLogin ? new Date(customer.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(customer.isActive)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CustomerRowMenu
                      customerId={String(customer.id)}
                      onView={() => router.push(`/dashboard/customers/${customer.id}`)}
                      onEdit={() => handleOpenEdit(customer)}
                      onDelete={() => handleDelete(String(customer.id))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-card px-6 py-4 gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <p className="text-sm text-muted-foreground font-display">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalCount}
                </span>{" "}
                results
              </p>
              <div className="hidden sm:flex items-center gap-2 ml-4 border-l border-border pl-4">
                <span className="text-xs text-muted-foreground">Rows per page:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <nav
                aria-label="Pagination"
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              >
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>
                
                <div className="flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border">
                  Page <span className="mx-1 font-bold text-primary">{currentPage}</span> of {totalPages || 1}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0 || loading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-muted focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <CustomerForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => {
          fetchCustomers();
          setIsFormOpen(false);
        }}
        customerToEdit={selectedCustomer}
      />
      
      {/* Import modals removed */}
    </div>
  );
}
