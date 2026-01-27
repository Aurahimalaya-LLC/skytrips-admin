"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import countriesData from "@/data/countries.json";
import { CreateAirportDTO, Airport } from "@/types/airport";
import { airports } from "../../../libs/shared-utils/constants/airport";

interface AirportData {
  name: string;
  city: string;
  country: string;
  IATA: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
}

interface AirportFormProps {
  initialData?: Airport;
  isEditing?: boolean;
}

export default function AirportForm({ initialData, isEditing = false }: AirportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateAirportDTO>({
    iata_code: "",
    name: "",
    city: "",
    country: "",
    latitude: undefined,
    longitude: undefined,
    timezone: "",
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        iata_code: initialData.iata_code,
        name: initialData.name,
        city: initialData.city,
        country: initialData.country,
        latitude: initialData.latitude || undefined,
        longitude: initialData.longitude || undefined,
        timezone: initialData.timezone || "",
        active: initialData.active,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || undefined : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.iata_code.length !== 3) {
      setError("IATA code must be exactly 3 characters.");
      setLoading(false);
      return;
    }

    try {
      const url = isEditing && initialData ? `/api/airports/${initialData.id}` : "/api/airports";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/dashboard/airports");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IATA Code */}
        <div className="space-y-2">
          <label htmlFor="iata_code" className="text-sm font-bold text-slate-700">
            IATA Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="iata_code"
            name="iata_code"
            required
            maxLength={3}
            value={formData.iata_code}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              if (val.length <= 3) {
                const airport = (airports as unknown as AirportData[]).find((a) => a.IATA === val);
                setFormData(prev => ({ 
                  ...prev, 
                  iata_code: val,
                  ...(airport ? {
                    name: airport.name,
                    city: airport.city,
                    country: airport.country,
                    latitude: parseFloat(airport.lat),
                    longitude: parseFloat(airport.lon),
                    timezone: airport.timezone
                  } : {})
                }));
              }
            }}
            placeholder="e.g. LHR"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono uppercase"
          />
        </div>

        {/* Airport Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-bold text-slate-700">
            Airport Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Heathrow Airport"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-bold text-slate-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={(e) => {
              const val = e.target.value;
              const airport = (airports as unknown as AirportData[]).find((a) => a.city.toLowerCase() === val.toLowerCase());
              
              setFormData(prev => ({
                ...prev,
                city: val,
                ...(airport ? {
                   iata_code: airport.IATA,
                   name: airport.name,
                   country: airport.country,
                   latitude: parseFloat(airport.lat),
                   longitude: parseFloat(airport.lon),
                   timezone: airport.timezone
                } : {})
              }));
            }}
            placeholder="e.g. London"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-bold text-slate-700">
            Country <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="country"
              name="country"
              required
              value={formData.country}
              onChange={handleChange}
              className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all appearance-none bg-white"
            >
              <option value="">Select Country</option>
              {countriesData.map((country) => (
                // Use country.name as the value because the DB stores full names in iso_country column
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Latitude */}
        <div className="space-y-2">
          <label htmlFor="latitude" className="text-sm font-bold text-slate-700">
            Latitude
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            step="any"
            value={formData.latitude ?? ""}
            onChange={handleChange}
            placeholder="e.g. 51.4700"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Longitude */}
        <div className="space-y-2">
          <label htmlFor="longitude" className="text-sm font-bold text-slate-700">
            Longitude
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            step="any"
            value={formData.longitude ?? ""}
            onChange={handleChange}
            placeholder="e.g. -0.4543"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Timezone */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="timezone" className="text-sm font-bold text-slate-700">
            Timezone
          </label>
          <input
            type="text"
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            placeholder="e.g. Europe/London"
            className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Active Status */}
        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <span className="text-sm font-bold text-slate-700">Active</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#2D8A76] text-white font-bold text-sm hover:bg-[#257564] transition-colors shadow-lg shadow-[#2D8A76]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          {isEditing ? "Update Airport" : "Create Airport"}
        </button>
      </div>
    </form>
  );
}
