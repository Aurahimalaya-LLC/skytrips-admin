"use client";

import AirportForm from "@/components/airports/AirportForm";

export default function CreateAirportPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Airport</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new airport record in the system.
          </p>
        </div>
      </div>
      
      <AirportForm />
    </div>
  );
}
