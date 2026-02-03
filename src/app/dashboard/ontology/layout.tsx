"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import NavigationMenu from "@/components/NavigationMenu";

export default function OntologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const tabs = [
    { label: "Overview", href: "/dashboard/ontology", exact: true },
    { label: "Payments to Agency", href: "/dashboard/ontology/payments-to-agency", exact: false },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full font-display">
       {/* Breadcrumb */}
      <nav className="flex mb-4 text-sm text-slate-500">
        <ol className="flex items-center gap-2">
          <li>Dashboard</li>
          <li>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </li>
          <li className="font-medium text-primary">Ontology</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ontology</h1>
        <p className="mt-1 text-sm text-slate-500">
           Manage system ontologies and agency financial flows.
        </p>
      </div>
      
      {/* Module Navigation */}
      <div className="mb-6">
         <NavigationMenu activeId="ontology" />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.exact 
              ? pathname === tab.href 
              : pathname?.startsWith(tab.href);
              
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
