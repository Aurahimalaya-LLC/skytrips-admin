"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { CompanyProfile, CompanyFormData, ContactMethod, PhoneNumber } from "@/types/company";
import { validateAddress, validatePhone } from "@/utils/companyValidation";

// --- Components ---

const ContactList = ({ items, icon }: { items: (ContactMethod | PhoneNumber)[]; icon: string }) => (
  <div className="space-y-1">
    {items.map((item) => (
      <div key={item.id} className="flex items-center gap-2 text-sm text-slate-600">
        <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>
        <span className="font-medium text-xs text-slate-400 uppercase w-12">{item.label}:</span>
        <span>{'standardizedValue' in item ? (item.standardizedValue || item.value) : item.value}</span>
      </div>
    ))}
  </div>
);

// --- Main Component ---

export default function CompanyManager() {
  // State
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof CompanyProfile | 'location'; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [showDeleted, setShowDeleted] = useState(false);

  // Form State
  const initialFormState: CompanyFormData = {
    name: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "", additionalInfo: "" },
    emails: [{ id: '1', label: 'Main', value: '' }],
    phones: [{ id: '1', label: 'Main', value: '', standardizedValue: '', countryCode: 'US' }],
    website: "",
    isHeadquarters: false,
  };
  const [formData, setFormData] = useState<CompanyFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Companies
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch ALL companies (active + deleted) so we can toggle views client-side
      const res = await fetch(`/api/companies?showDeleted=false`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      } else {
        console.error("Failed to fetch companies");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // --- Actions ---

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        const res = await fetch(`/api/companies/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (res.ok) {
          const updated = await res.json();
          setCompanies(prev => prev.map(c => c.id === editingId ? updated : c));
          closeModal();
        } else {
          alert("Failed to update company");
        }
      } else {
        const res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const created = await res.json();
          setCompanies(prev => [created, ...prev]);
          closeModal();
        } else {
          alert("Failed to create company");
        }
      }
    } catch (error) {
      console.error("Error saving company:", error);
      alert("An error occurred while saving");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      try {
        const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
        if (res.ok) {
          // Optimistic update or refetch
          setCompanies(prev => prev.filter(c => c.id !== id)); 
          // Note: If we are in "Active" view, removing it is correct.
          // If we want to move it to trash, we might need to re-fetch if we are showing mixed.
          // But currently handleDelete is soft delete.
          fetchCompanies();
        }
      } catch (error) {
        console.error("Error deleting company:", error);
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt: null }),
      });
      if (res.ok) {
        fetchCompanies();
      }
    } catch (error) {
      console.error("Error restoring company:", error);
    }
  };

  const handleHardDelete = async (id: string) => {
    if (confirm("This will permanently remove the data. Continue?")) {
      try {
        const res = await fetch(`/api/companies/${id}?hard=true`, { method: 'DELETE' });
        if (res.ok) {
          setCompanies(prev => prev.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error("Error permanently deleting company:", error);
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Company name is required";
    if (formData.name.length > 100) errors.name = "Company name too long";
    
    // Check duplicates (Client-side check on currently loaded companies)
    // Note: This might need to be server-side if not all companies are loaded
    const isDuplicate = companies.some(c => c.name.toLowerCase() === formData.name.toLowerCase() && c.id !== editingId && !c.deletedAt);
    if (isDuplicate) errors.name = "Company name already exists";

    // Address validation
    const addressErrors = validateAddress(formData.address);
    Object.assign(errors, addressErrors);

    // Email validation
    formData.emails.forEach((e, i) => {
        if (e.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value)) {
            errors[`email_${i}`] = "Invalid email format";
        }
    });

    // Phone validation
    formData.phones.forEach((p, i) => {
        if (p.value && !validatePhone(p.value, (p.countryCode as any) || 'US')) {
             errors[`phone_${i}`] = "Invalid phone number";
        }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openModal = (company?: CompanyProfile) => {
    if (company) {
      setEditingId(company.id);
      setFormData({
        name: company.name,
        address: { ...company.address },
        emails: [...company.emails],
        phones: [...company.phones],
        website: company.website || "",
        isHeadquarters: company.isHeadquarters,
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleExport = () => {
    const headers = ["ID", "Name", "City", "Country", "Primary Email"];
    const csvContent = [
      headers.join(","),
      ...filteredCompanies.map(c => [
        c.id, 
        `"${c.name}"`, 
        `"${c.address.city}"`, 
        `"${c.address.country}"`, 
        c.emails[0]?.value || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companies.csv";
    a.click();
  };

  // --- Computed ---

  const filteredCompanies = useMemo(() => {
    return companies
      .filter(c => showDeleted ? c.deletedAt : !c.deletedAt)
      .filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.emails.some(e => e.value.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        if (sortConfig.key === 'location') {
            return a.address.city.localeCompare(b.address.city) * dir;
        }
        return String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || '')) * dir;
      });
  }, [companies, searchQuery, sortConfig, showDeleted]);

  // --- Render Helpers ---

  const handleSort = (key: any) => {
      setSortConfig(curr => ({ key, direction: curr.key === key && curr.direction === 'asc' ? 'desc' : 'asc' }));
  };

  if (isLoading && companies.length === 0) {
      return (
          <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                <input 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">view_list</span>
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">grid_view</span>
                </button>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowDeleted(!showDeleted)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${showDeleted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
                {showDeleted ? 'Show Active' : 'Trash Bin'}
            </button>
            <button 
                onClick={handleExport}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export
            </button>
            <button 
                onClick={() => openModal()}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Company
            </button>
        </div>
      </div>

      {/* Content */}
      {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">domain_disabled</span>
              <p className="text-slate-500 font-medium">No companies found</p>
          </div>
      ) : (
          viewMode === 'list' ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors">Company</th>
                                <th onClick={() => handleSort('location')} className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors">Location</th>
                                <th className="px-6 py-4">Contacts</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCompanies.map(company => (
                                <tr key={company.id} className={`group hover:bg-slate-50/50 transition-colors ${company.deletedAt ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                                                {company.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    {company.name}
                                                    {company.isHeadquarters && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded uppercase">HQ</span>}
                                                    {company.deletedAt && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded uppercase">Deleted</span>}
                                                </div>
                                                <a href={company.website} target="_blank" className="text-xs text-slate-500 hover:text-primary truncate block max-w-[200px]">{company.website}</a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-900 font-medium">{company.address.city}, {company.address.country}</div>
                                        <div className="text-xs text-slate-500">{company.address.street}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            {company.emails[0] && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                                                    <span className="truncate max-w-[150px]">{company.emails[0].value}</span>
                                                    {company.emails.length > 1 && <span className="text-slate-400">+{company.emails.length - 1}</span>}
                                                </div>
                                            )}
                                            {company.phones[0] && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>
                                                    <span>{company.phones[0].value}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {company.deletedAt ? (
                                                <>
                                                    <button onClick={() => handleRestore(company.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Restore">
                                                        <span className="material-symbols-outlined text-[20px]">restore_from_trash</span>
                                                    </button>
                                                    <button onClick={() => handleHardDelete(company.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete Permanently">
                                                        <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => openModal(company)} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded" title="Edit">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(company.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => (
                    <div key={company.id} className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all ${company.deletedAt ? 'opacity-75 grayscale' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
                                {company.name[0]}
                            </div>
                            {company.isHeadquarters && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">HQ</span>}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{company.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {company.address.city}, {company.address.country}
                        </p>
                        
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <ContactList items={company.emails} icon="mail" />
                            <ContactList items={company.phones} icon="call" />
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                             {company.deletedAt ? (
                                <button onClick={() => handleRestore(company.id)} className="text-sm font-medium text-emerald-600 hover:underline">Restore</button>
                            ) : (
                                <>
                                    <button onClick={() => openModal(company)} className="text-sm font-medium text-primary hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(company.id)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          )
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Company' : 'Add New Company'}</h2>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Company Name *</label>
                            <input 
                                className={`w-full h-10 px-3 rounded-lg border ${formErrors.name ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 transition-all`}
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g. Acme Corp"
                            />
                            {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={formData.isHeadquarters}
                                    onChange={e => setFormData(prev => ({ ...prev, isHeadquarters: e.target.checked }))}
                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium text-slate-700">Set as Headquarters</span>
                            </label>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">home_pin</span>
                            Address
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input 
                                    className={`w-full h-10 px-3 rounded-lg border ${formErrors.street ? 'border-red-300' : 'border-slate-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="Street Address"
                                    value={formData.address.street}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                                />
                                {formErrors.street && <p className="text-xs text-red-600 mt-1">{formErrors.street}</p>}
                            </div>
                            <div>
                                <input 
                                    className={`w-full h-10 px-3 rounded-lg border ${formErrors.city ? 'border-red-300' : 'border-slate-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="City"
                                    value={formData.address.city}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                                />
                                {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                            </div>
                            <div>
                                <input 
                                    className={`w-full h-10 px-3 rounded-lg border ${formErrors.state ? 'border-red-300' : 'border-slate-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="State/Province"
                                    value={formData.address.state}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                                />
                                {formErrors.state && <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>}
                            </div>
                            <div>
                                <input 
                                    className={`w-full h-10 px-3 rounded-lg border ${formErrors.postalCode ? 'border-red-300' : 'border-slate-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="Postal Code"
                                    value={formData.address.postalCode}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, postalCode: e.target.value } }))}
                                />
                                {formErrors.postalCode && <p className="text-xs text-red-600 mt-1">{formErrors.postalCode}</p>}
                            </div>
                            <div>
                                <input 
                                    className={`w-full h-10 px-3 rounded-lg border ${formErrors.country ? 'border-red-300' : 'border-slate-200'} focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="Country"
                                    value={formData.address.country}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, country: e.target.value } }))}
                                />
                                {formErrors.country && <p className="text-xs text-red-600 mt-1">{formErrors.country}</p>}
                            </div>
                            <div className="col-span-2">
                                <input 
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="Additional Info (Optional)"
                                    value={formData.address.additionalInfo || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, additionalInfo: e.target.value } }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">contacts</span>
                                Contacts
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, emails: [...prev.emails, { id: crypto.randomUUID(), label: 'Work', value: '' }] }))}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span> Add Email
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {formData.emails.map((email, idx) => (
                                <div key={email.id} className="flex gap-2">
                                    <input 
                                        className="w-24 h-9 px-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50"
                                        value={email.label}
                                        onChange={e => {
                                            const newEmails = [...formData.emails];
                                            newEmails[idx].label = e.target.value;
                                            setFormData(prev => ({ ...prev, emails: newEmails }));
                                        }}
                                        placeholder="Label"
                                    />
                                    <div className="flex-1 relative">
                                        <input 
                                            className={`w-full h-9 px-3 rounded-lg border ${formErrors[`email_${idx}`] ? 'border-red-300' : 'border-slate-200'} focus:ring-2 focus:ring-primary/20 text-sm`}
                                            value={email.value}
                                            onChange={e => {
                                                const newEmails = [...formData.emails];
                                                newEmails[idx].value = e.target.value;
                                                setFormData(prev => ({ ...prev, emails: newEmails }));
                                            }}
                                            placeholder="Email Address"
                                        />
                                        {formErrors[`email_${idx}`] && <span className="absolute right-2 top-2.5 text-red-500 material-symbols-outlined text-[16px]">error</span>}
                                    </div>
                                    <button 
                                        onClick={() => setFormData(prev => ({ ...prev, emails: prev.emails.filter((_, i) => i !== idx) }))}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Phones</h3>
                             <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, phones: [...prev.phones, { id: crypto.randomUUID(), label: 'Mobile', value: '' }] }))}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span> Add Phone
                            </button>
                        </div>
                        <div className="space-y-3">
                             {formData.phones.map((phone, idx) => (
                                <div key={phone.id} className="flex gap-2">
                                    <input 
                                        className="w-24 h-9 px-2 rounded-lg border border-slate-200 text-xs font-medium bg-slate-50"
                                        value={phone.label}
                                        onChange={e => {
                                            const newPhones = [...formData.phones];
                                            newPhones[idx].label = e.target.value;
                                            setFormData(prev => ({ ...prev, phones: newPhones }));
                                        }}
                                        placeholder="Label"
                                    />
                                    <div className="flex-1 relative">
                                        <input 
                                            className={`w-full h-9 px-3 rounded-lg border ${formErrors[`phone_${idx}`] ? 'border-red-300' : 'border-slate-200'} focus:ring-2 focus:ring-primary/20 text-sm`}
                                            value={phone.value}
                                            onChange={e => {
                                                const newPhones = [...formData.phones];
                                                newPhones[idx].value = e.target.value;
                                                setFormData(prev => ({ ...prev, phones: newPhones }));
                                            }}
                                            placeholder="Phone Number"
                                        />
                                        {formErrors[`phone_${idx}`] && <span className="absolute right-2 top-2.5 text-red-500 material-symbols-outlined text-[16px]" title={formErrors[`phone_${idx}`]}>error</span>}
                                    </div>
                                     <button 
                                        onClick={() => setFormData(prev => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }))}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button 
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all"
                    >
                        {editingId ? 'Save Changes' : 'Create Company'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
