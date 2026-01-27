"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AirportForm from "@/components/airports/AirportForm";
import { Airport } from "@/types/airport";

export default function EditAirportPage() {
  const params = useParams();
  const router = useRouter();
  const [airport, setAirport] = useState<Airport | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirport = async () => {
      try {
        const res = await fetch(`/api/airports/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch airport");
        }

        setAirport(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAirport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 font-medium">{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Airport</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update details for {airport?.name} ({airport?.iata_code})
          </p>
        </div>
      </div>
      
      <AirportForm initialData={airport} isEditing />
    </div>
  );
}
