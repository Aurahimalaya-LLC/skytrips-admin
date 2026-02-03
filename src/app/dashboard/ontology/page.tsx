"use client";

import Link from "next/link";

export default function OntologyOverviewPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">
        category
      </span>
      <h3 className="text-lg font-bold text-slate-900">Ontology Overview</h3>
      <p className="text-slate-500 mt-2 max-w-md mx-auto">
        Select a tab to view specific ontology data.
      </p>
      <div className="mt-6 flex justify-center gap-4">
          <Link 
            href="/dashboard/ontology/payments-to-agency"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
          >
            <span className="material-symbols-outlined">payments</span>
            View Agency Payments
          </Link>
      </div>
    </div>
  );
}
