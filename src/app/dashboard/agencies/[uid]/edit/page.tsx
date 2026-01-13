"use client";
import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function AgencyEditPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    agency_name: "",
    contact_person: "",
    number: "",
    iata_code: "",
    status: "active",
    booking_ids: [] as number[],
    draft: true,
  });
  const [initial, setInitial] = useState<typeof form | null>(null);
  const changed = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/agencies/${uid}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed to load agency");
        const a = j.agency;
        setForm({
          agency_name: a.agency_name || "",
          contact_person: a.contact_person || "",
          number: a.number || "",
          iata_code: a.iata_code || "",
          status: a.status || "active",
          booking_ids: (j.bookings || []).map((b: { booking_id: number }) => b.booking_id),
          draft: !!a.draft,
        });
        setInitial({
          agency_name: a.agency_name || "",
          contact_person: a.contact_person || "",
          number: a.number || "",
          iata_code: a.iata_code || "",
          status: a.status || "active",
          booking_ids: (j.bookings || []).map((b: { booking_id: number }) => b.booking_id),
          draft: !!a.draft,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const submit = async (publish: boolean) => {
    setLoading(true);
    setError(null);
    try {
      if (!confirm(publish ? "Publish changes?" : "Save draft changes?")) {
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/agencies/${uid}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, draft: !publish }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to save agency");
      router.push(`/dashboard/agencies/${uid}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full font-display">
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li>Agencies</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li className="font-medium text-primary">Edit</li>
        </ol>
      </nav>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Agency: {uid}</h1>
          </div>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Agency Name</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary" value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Contact Person</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">IATA Code</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary" value={form.iata_code} onChange={(e) => setForm({ ...form, iata_code: e.target.value })} />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-slate-700">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Booking IDs</label>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary" value={form.booking_ids.join(",")} onChange={(e) => {
            const ids = e.target.value.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
            setForm({ ...form, booking_ids: ids });
          }} />
        </div>

        <div className="flex items-center justify-between">
          <div className={`text-sm font-bold ${changed ? "text-amber-600" : "text-slate-500"}`}>{changed ? "Unsaved changes" : "No changes"}</div>
          <div className="flex items-center gap-2">
            <button disabled={loading} onClick={() => submit(false)} className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 disabled:opacity-50">Save draft</button>
            <button disabled={loading} onClick={() => submit(true)} className="rounded-lg bg-primary text-white px-4 py-2 font-bold disabled:opacity-50">{loading ? "Saving..." : "Publish"}</button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Change history</h3>
          <button
            className="text-primary hover:underline text-sm font-bold inline-flex items-center gap-1"
            onClick={async () => {
              try {
                const res = await fetch(`/api/agencies/${uid}/history`);
                const j = await res.json();
                if (!res.ok) throw new Error(j.error || "Failed to load history");
                alert(`History entries: ${j.data?.length || 0}`);
              } catch (e) {
                alert(e instanceof Error ? e.message : "Unknown error");
              }
            }}
          >
            View history
            <span className="material-symbols-outlined text-[16px]">history</span>
          </button>
        </div>
      </div>
    </div>
  );
}
