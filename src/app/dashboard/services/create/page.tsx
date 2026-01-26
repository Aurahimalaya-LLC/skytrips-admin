"use client";

import Link from "next/link";
import ServiceForm from "@/components/ServiceForm";

export default function CreateServicePage() {
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
          <li className="font-medium text-primary">Create New</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new service to your offering.
        </p>
      </div>

      <ServiceForm />
    </div>
  );
}
