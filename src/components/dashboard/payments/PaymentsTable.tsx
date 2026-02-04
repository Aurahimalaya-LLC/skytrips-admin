"use client";

import { useState, useEffect, useCallback } from "react";
import { Payment, SortField, SortOrder } from "@/types/payment";
import { supabase } from "@/lib/supabase"; 
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface PaymentsTableProps {
  viewMode: 'customers' | 'agencies';
  dateRange: { start: string | null; end: string | null };
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function PaymentsTable({ viewMode, dateRange }: PaymentsTableProps) {
  // Data State
  const [data, setData] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('created_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('view_unified_payments')
        .select('*', { count: 'exact' });

      // Apply View Mode Filter
      const sourceFilter = viewMode === 'customers' ? 'Customer' : 'Agency';
      query = query.eq('payment_source', sourceFilter);

      // Apply Search
      if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        // Supabase JS .or() expects strict syntax and doesn't support casting (::text) inside the string.
        // We handle IDs by checking the format of the search term.
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm);
        const isNumeric = /^\d+$/.test(searchTerm);

        const orConditions = [
            `customer_name.ilike.${searchPattern}`,
            `agency_name.ilike.${searchPattern}`,
            `contact_person.ilike.${searchPattern}`
        ];

        if (isUUID) {
            orConditions.push(`payment_id.eq.${searchTerm}`);
        }

        if (isNumeric) {
             orConditions.push(`booking_id.eq.${searchTerm}`);
        }

        query = query.or(orConditions.join(','));
      }

      // Apply Status Filter
      if (statusFilter !== "ALL") {
        query = query.eq('status', statusFilter);
      }

      // Apply Date Filter
      if (dateRange.start) {
        query = query.gte('created_date', dateRange.start);
      }
      if (dateRange.end) {
        query = query.lte('created_date', dateRange.end);
      }

      // Apply Sorting
      const safeSortField = (['selling_price', 'cost_price', 'customer_name'].includes(sortField) && data.length > 0 && !(sortField in data[0])) 
        ? 'created_date' 
        : sortField;
      
      query = query.order(safeSortField, { ascending: sortOrder === 'asc' });

      // Apply Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: fetchedData, error: fetchError, count } = await query;

      if (fetchError && String(fetchError.code) === '42703' && (sortField === 'selling_price' || sortField === 'cost_price' || sortField === 'customer_name')) {
        console.warn(`Sort field ${sortField} missing, falling back to created_date`);
        setSortField('created_date');
        return; // useEffect will re-trigger with safe field
      }

      if (fetchError) {
        // Handle missing column error (42703) - likely due to invalid sort field
        if (String(fetchError.code) === '42703' && ['selling_price', 'cost_price', 'customer_name'].includes(sortField)) {
           console.warn(`Sort field ${sortField} missing, falling back to created_date`);
           setSortField('created_date');
           return; // Trigger re-fetch via useEffect
        }

        console.error("Supabase fetch error:", fetchError);
        throw fetchError;
      }

      console.log(`Fetched ${fetchedData?.length || 0} payments for ${viewMode}`);
      setData(fetchedData as Payment[]);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err instanceof Error ? err.message : "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, page, pageSize, sortField, sortOrder, searchTerm, statusFilter, dateRange]);

  // Debounce Search & Fetch
  useEffect(() => {
    console.log("PaymentsTable: Triggering fetch due to state change", { viewMode, searchTerm, statusFilter, dateRange });
    const timer = setTimeout(() => {
      fetchPayments();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPayments, viewMode, searchTerm, statusFilter, dateRange]);


  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new field
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ payment_status: newStatus })
        .eq('payment_id', paymentId);

      if (updateError) throw updateError;

      // Optimistic update
      setData(prev => prev.map(p => 
        p.payment_id === paymentId ? { ...p, status: newStatus as Payment['status'] } : p
      ));
      setEditingId(null);
    } catch (err) {
      alert(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const exportCSV = () => {
    const isCustomer = viewMode === 'customers';
    const headers = ["Booking ID", "Traveller Name", isCustomer ? "Selling Price" : "Cost Price", "Date", "Status"];
    const csvRows = [headers.join(",")];

    data.forEach(row => {
      const name = getTravellerDisplay(row);
      const price = isCustomer ? (row.selling_price || 0) : (row.cost_price || 0);
      const values = [
        `BK-${row.booking_id}`,
        `"${name}"`,
        price,
        new Date(row.payment_date).toLocaleDateString(),
        row.status
      ];
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${viewMode}-${new Date().toISOString()}.csv`;
    a.click();
  };
  
  const exportPDF = () => {
    const doc = new jsPDF();
    const isCustomer = viewMode === 'customers';
    doc.text(`${isCustomer ? 'Customer' : 'Agency'} Payments Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Booking ID", "Traveller Name", isCustomer ? "Selling Price" : "Cost Price", "Date", "Status"];
    const tableRows: (string | number)[][] = [];

    data.forEach(row => {
      const name = getTravellerDisplay(row);
      const price = isCustomer ? (row.selling_price || 0) : (row.cost_price || 0);
      const rowData = [
        `BK-${row.booking_id}`,
        name,
        formatCurrency(price),
        new Date(row.payment_date).toLocaleDateString(),
        row.status,
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });

    doc.save(`payments-${viewMode}.pdf`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const getTravellerDisplay = (row: Payment) => {
    if (row.travellers_json && Array.isArray(row.travellers_json) && row.travellers_json.length > 0) {
      return row.travellers_json
        .map((t) => {
          const trav = t as Record<string, string>;
          return `${trav.firstName || ''} ${trav.lastName || ''}`.trim();
        })
        .filter(Boolean)
        .join(', ');
    }
    return row.customer_name || 'N/A';
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let color = "bg-gray-100 text-gray-800";
    if (status === 'Completed' || status === 'PAID') color = "bg-green-100 text-green-800";
    else if (status === 'Pending' || status === 'PARTIAL') color = "bg-yellow-100 text-yellow-800";
    else if (status === 'Failed' || status === 'UNPAID') color = "bg-red-100 text-red-800";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search ID, Name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="border border-input bg-background text-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchPayments()}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
           <button 
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">csv</span>
            CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p>Loading payments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive">
            <span className="material-symbols-outlined text-3xl mb-2">error</span>
            <p>{error}</p>
            <button onClick={() => fetchPayments()} className="mt-2 text-primary hover:underline">Retry</button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
             <span className="material-symbols-outlined text-4xl mb-3 opacity-20">payments</span>
             <p className="text-lg font-medium mb-1">No payments found</p>
             <p className="text-sm opacity-70">
               {searchTerm || statusFilter !== 'ALL' || dateRange.start || dateRange.end 
                 ? "Try adjusting your filters or search term to find what you're looking for." 
                 : `There are currently no transactions for ${viewMode}.`}
             </p>
             {(searchTerm || statusFilter !== 'ALL' || dateRange.start || dateRange.end) && (
               <button 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  // Note: dateRange reset should happen in parent
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
               >
                 Clear all filters
               </button>
             )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('booking_id')}>
                    <div className="flex items-center gap-1">
                      Booking ID
                      {sortField === 'booking_id' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort(viewMode === 'customers' ? 'customer_name' : 'agency_name')}>
                    <div className="flex items-center gap-1">
                      Traveller&apos;s Name
                      {(sortField === 'customer_name' || sortField === 'agency_name') && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort(viewMode === 'customers' ? 'selling_price' : 'cost_price')}>
                    <div className="flex items-center gap-1">
                      {viewMode === 'customers' ? 'SP (Selling Price)' : 'CP (Cost Price)'}
                      {(sortField === 'selling_price' || sortField === 'cost_price') && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted hidden md:table-cell" onClick={() => handleSort('created_date')}>
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === 'created_date' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-muted" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-1">
                      Payment Status
                      {sortField === 'status' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.payment_id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">
                      BK-{row.booking_id}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {getTravellerDisplay(row)}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {viewMode === 'customers' 
                        ? formatCurrency(row.selling_price || row.amount || 0) 
                        : formatCurrency(row.cost_price || row.amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {new Date(row.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === row.payment_id ? (
                        <select
                          autoFocus
                          className="border border-primary rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          onBlur={() => {
                            if (editStatus !== row.status) {
                                handleStatusUpdate(row.payment_id, editStatus);
                            } else {
                                setEditingId(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleStatusUpdate(row.payment_id, editStatus);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      ) : (
                        <div 
                            className="cursor-pointer" 
                            onClick={() => {
                                setEditingId(row.payment_id);
                                setEditStatus(row.status);
                            }}
                            title="Click to edit status"
                        >
                            <StatusBadge status={row.status} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="bg-muted/50 px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border border-input bg-background text-foreground rounded-md text-xs py-1 px-2 focus:outline-none"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
            
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount}
                className="p-1 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
