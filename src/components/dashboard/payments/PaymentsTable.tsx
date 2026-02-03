"use client";

import { useState, useEffect, useCallback } from "react";
import { Payment, SortField, SortOrder } from "@/types/payment";
import { supabase } from "@/lib/supabase"; 
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface PaymentsTableProps {
  viewMode: 'customers' | 'agencies';
}

const PAGE_SIZES = [10, 25, 50, 100];

export default function PaymentsTable({ viewMode }: PaymentsTableProps) {
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
        // Use a raw filter or simple OR if possible. 
        // Supabase JS .or() expects strict syntax.
        query = query.or(`customer_name.ilike.${searchPattern},agency_name.ilike.${searchPattern},payment_id.ilike.${searchPattern}`);
      }

      // Apply Status Filter
      if (statusFilter !== "ALL") {
        query = query.eq('status', statusFilter);
      }

      // Apply Sorting
      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      // Apply Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: fetchedData, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setData(fetchedData as Payment[]);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err instanceof Error ? err.message : "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }, [viewMode, page, pageSize, sortField, sortOrder, searchTerm, statusFilter]);

  // Debounce Search & Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPayments]);


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
    const headers = ["ID", "Booking ID", "Date", "Entity", "Amount", "Status"];
    const csvRows = [headers.join(",")];

    data.forEach(row => {
      const entity = viewMode === 'customers' ? row.customer_name : row.agency_name;
      const values = [
        row.payment_id,
        row.booking_id,
        new Date(row.payment_date).toLocaleDateString(),
        `"${entity || ''}"`,
        row.amount,
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
    doc.text(`${viewMode === 'customers' ? 'Customer' : 'Agency'} Payments Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Date", "ID", "Entity", "Amount", "Status"];
    const tableRows: (string | number)[][] = [];

    data.forEach(payment => {
      const entity = viewMode === 'customers' ? payment.customer_name : payment.agency_name;
      const paymentData = [
        new Date(payment.payment_date).toLocaleDateString(),
        payment.payment_id.substring(0, 8) + '...',
        entity || 'N/A',
        formatCurrency(payment.amount),
        payment.status,
      ];
      tableRows.push(paymentData);
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search ID, Name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">csv</span>
            CSV
          </button>
          <button 
            onClick={exportPDF}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">sync</span>
            <p>Loading payments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <span className="material-symbols-outlined text-3xl mb-2">error</span>
            <p>{error}</p>
            <button onClick={() => fetchPayments()} className="mt-2 text-blue-600 hover:underline">Retry</button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
             <p>No payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('payment_id')}>
                    <div className="flex items-center gap-1">
                      Transaction ID
                      {sortField === 'payment_id' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('booking_id')}>
                    <div className="flex items-center gap-1">
                      Booking Ref
                      {sortField === 'booking_id' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('created_date')}>
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === 'created_date' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3">
                    {viewMode === 'customers' ? 'Customer / Traveller' : 'Agency'}
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('amount')}>
                     <div className="flex items-center gap-1">
                      Amount
                      {sortField === 'amount' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('status')}>
                     <div className="flex items-center gap-1">
                      Status
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
              <tbody className="divide-y divide-slate-200">
                {data.map((row) => (
                  <tr key={row.payment_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      #{row.payment_id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      BK-{row.booking_id}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(row.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-900">
                      {(() => {
                        if (viewMode === 'agencies') return row.agency_name || 'N/A';
                        
                        // Fallback logic for customer name
                        if (row.customer_name && row.customer_name !== 'N/A') return row.customer_name;
                        
                        if (row.customer_json) {
                           const c = row.customer_json as Record<string, string>;
                           if (c.firstName || c.lastName) return `${c.firstName || ''} ${c.lastName || ''}`.trim();
                           if (c.email) return c.email;
                         }
                         
                         if (row.travellers_json && Array.isArray(row.travellers_json) && row.travellers_json.length > 0) {
                           const t = row.travellers_json[0] as Record<string, string>;
                           if (t.firstName || t.lastName) return `${t.firstName || ''} ${t.lastName || ''}`.trim();
                         }
                        
                        return 'N/A';
                      })()}
                      {viewMode === 'agencies' && row.cp && (
                        <div className="text-xs text-slate-400">{row.cp}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === row.payment_id ? (
                        <select
                          autoFocus
                          className="border border-blue-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            title="Click to edit"
                        >
                            <StatusBadge status={row.status} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors">
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
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border border-slate-300 rounded-md text-xs py-1 px-2 focus:outline-none"
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
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
