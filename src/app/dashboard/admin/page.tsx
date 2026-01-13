"use client";
import NavigationMenu from "@/components/NavigationMenu";

export default function AdminHubPage() {
  return (
    <div className="max-w-7xl mx-auto w-full font-display">
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li className="font-medium text-primary">Admin Hub</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Hub</h1>
        <p className="mt-1 text-sm text-slate-500">Manage media and settings with quick navigation.</p>
      </div>

      <section id="media" className="mb-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Media</h2>
        <p className="text-sm text-slate-600">Manage media assets and libraries.</p>
      </section>

      <div className="mb-6">
        <NavigationMenu activeId="media" />
      </div>

      <section id="settings" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Settings</h2>
        <p className="text-sm text-slate-600">Configure application settings and preferences.</p>
      </section>
    </div>
  );
}
