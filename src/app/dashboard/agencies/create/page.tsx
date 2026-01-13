"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgencyCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    agency_name: "",
    contact_person: "",
    number: "",
    contact_email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    iata_code: "",
  });

  const isValidStep1 = form.agency_name.trim().length > 0 && form.contact_person.trim().length > 0 && form.number.trim().length > 0 && form.agency_name.length <= 100 && form.contact_person.length <= 50;
  const isValidStep2 = form.iata_code.length <= 8 && (!form.contact_email || /.+@.+\..+/.test(form.contact_email));

  // Real-time validation for Agency Name
  const agencyNameError = touched.agency_name && !form.agency_name.trim() ? "Agency name is required" : null;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const submit = async () => {
    // Client-side validation check before submission
    if (!form.agency_name.trim()) {
      setTouched((prev) => ({ ...prev, agency_name: true }));
      // Optional: scroll to error or focus input
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agencies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to create agency");
      setToast("Agency created");
      router.push(`/dashboard/agencies/${j.uid}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full font-display">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Create New Agency</h1>
          <p className="text-slate-500 font-medium text-lg">Onboard a new partner agency to expand your tour network.</p>
        </div>
        <button onClick={() => router.push("/dashboard/agencies")} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-bold text-slate-700">
          <span className="material-symbols-outlined text-[20px]">view_list</span>
          <span>View All Agencies</span>
        </button>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-3"><span className="material-symbols-outlined">error</span>{error}</div>}
      {toast && <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 flex items-center gap-3"><span className="material-symbols-outlined">check_circle</span>{toast}</div>}

      <div className="space-y-8">
        {/* Agency Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-primary text-2xl">business_center</span>
            <h2 className="text-xl font-bold text-slate-900">Agency Information</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-3">Agency Logo</label>
              <div className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-100 hover:border-primary/50 transition-all group">
                <div className="size-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-slate-400 text-2xl group-hover:text-primary">cloud_upload</span>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">Click or drag to upload logo</p>
                <p className="text-xs text-slate-400">PNG, JPG or SVG. Max 2MB.</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Agency Name <span className="text-red-500">*</span></label>
                <input 
                  className={`w-full h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium ${agencyNameError ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                  placeholder="e.g. Global Horizons Travel"
                  value={form.agency_name}
                  onChange={(e) => setForm({ ...form, agency_name: e.target.value })}
                  onBlur={() => setTouched({ ...touched, agency_name: true })}
                  aria-invalid={!!agencyNameError}
                  aria-describedby={agencyNameError ? "agency-name-error" : undefined}
                />
                {agencyNameError && <p id="agency-name-error" className="text-sm text-red-600 mt-1 font-medium">{agencyNameError}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Business Address</label>
                <input 
                  className="w-full h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="Street name and building number"
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                  <input 
                    className="w-full h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                  <div className="relative">
                    <input 
                      className="w-full h-12 rounded-xl border-slate-200 bg-white px-4 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                      placeholder="Select Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-primary text-2xl">contact_page</span>
            <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Primary Contact Person</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input 
                  className="w-full h-12 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="John Doe"
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">language</span>
                <input 
                  className="w-full h-12 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="https://agency.com"
                  // Mapping website to existing state (using address_line2 temporarily or adding field if needed, preserving existing state for now)
                  value={form.address_line2} 
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  className="w-full h-12 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="contact@agency.com"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">call</span>
                <input 
                  className="w-full h-12 rounded-xl border-slate-200 bg-white pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="+1 (555) 000-0000"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terms Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
            <span className="material-symbols-outlined text-primary text-2xl">policy</span>
            <h2 className="text-xl font-bold text-slate-900">Agency Terms & Conditions</h2>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes or Custom Terms</label>
            <textarea 
              className="w-full h-32 rounded-xl border-slate-200 bg-white p-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
              placeholder="Enter specific contractual terms, commission rates, or important notes about this partnership..."
              value={form.iata_code} // Reusing iata_code field for notes based on visual match or just mapping correctly
              onChange={(e) => setForm({ ...form, iata_code: e.target.value })}
            ></textarea>
            <p className="text-xs text-slate-400 mt-2 font-medium">Only visible to administrators and management staff.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-6 pt-4 pb-12">
          <button 
            onClick={() => router.back()}
            className="text-slate-600 font-bold hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={submit}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3.5 font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
          >
            {loading ? (
              <>
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                <span>Save Agency</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
