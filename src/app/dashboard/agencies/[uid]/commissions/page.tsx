
"use client";

import Link from "next/link";
import { useState } from "react";
import AddCommissionModal from "@/components/agency/AddCommissionModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function AgencyCommissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Record<string, unknown> | null>(null);
  const [commissionToDelete, setCommissionToDelete] = useState<Record<string, unknown> | null>(null);

  // Mock data matching the design image
  const commissions = [
    {
      id: 1,
      airline: "Emirates",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg",
      type: "PERCENTAGE",
      value: "5.00%",
      status: "ACTIVE",
    },
    {
      id: 2,
      airline: "Qatar Airways",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Qatar_Airways_Logo.svg", // Using a placeholder if needed, or SVG logic
      type: "FIXED",
      value: "$25.00",
      status: "ACTIVE",
    },
    {
      id: 3,
      airline: "Lufthansa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg",
      type: "PERCENTAGE",
      value: "3.50%",
      status: "INACTIVE",
    },
  ];

  const filteredCommissions = commissions.filter((c) =>
    c.airline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setSelectedCommission(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (commission: Record<string, unknown>) => {
    setSelectedCommission(commission);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (commission: Record<string, unknown>) => {
    setCommissionToDelete(commission);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    console.log("Deleting commission:", commissionToDelete);
    setIsDeleteModalOpen(false);
    setCommissionToDelete(null);
    // Add logic to refresh data
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full font-display pb-12 space-y-6">
      {/* Breadcrumbs */}
      <nav className="text-sm font-medium text-slate-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard/agencies" className="hover:text-primary transition-colors">
              Agencies
            </Link>
          </li>
          <li className="text-slate-300">/</li>
          <li>
            <Link href="/dashboard/agencies/uid" className="hover:text-primary transition-colors">
              Global Travels Co.
            </Link>
          </li>
          <li className="text-slate-300">/</li>
          <li className="text-slate-900 font-bold">Airline Commissions</li>
        </ol>
      </nav>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl">
            %
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Airline Commissions</h1>
            <p className="text-slate-500 font-medium">Manage custom commission rates for Global Travels Co.</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="h-10 px-4 rounded-lg bg-[#00A76F] text-white font-bold text-sm hover:bg-[#009462] flex items-center gap-2 shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Airline Commission
        </button>
      </div>

      <AddCommissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={(data) => {
          console.log("Saved commission:", data, "Updating ID:", selectedCommission?.id);
          setIsModalOpen(false);
          // Here you would typically refresh data or update state
        }}
        initialData={selectedCommission}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Commission"
        message={`Are you sure you want to delete the commission rule for ${
          commissionToDelete?.airline || "this airline"
        }? This action cannot be undone.`}
      />

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">list_alt</span>
            <h2 className="text-lg font-bold text-slate-900">Active Commissions</h2>
          </div>
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter airlines..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Airline</th>
                <th className="px-6 py-4">Commission Type</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCommissions.length > 0 ? (
                filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-md bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                           {/* Using a placeholder text if image fails or for simplicity */}
                           <span className="text-[10px] font-bold text-slate-400">LOGO</span>
                           {/* In real app, use next/image with fallback */}
                        </div>
                        <span className="font-bold text-slate-900">{commission.airline}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                        commission.type === 'PERCENTAGE' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {commission.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {commission.value}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                        commission.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(commission)}
                          className="text-slate-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(commission)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No commissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 font-medium">
            Showing {filteredCommissions.length} airlines with custom commissions
          </p>
          <div className="flex items-center gap-2">
            <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg bg-[#00A76F] text-white text-sm font-bold shadow-sm">
              1
            </button>
            <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
