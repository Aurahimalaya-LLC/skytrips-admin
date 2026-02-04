"use client";

import { useState, useEffect } from "react";
import { FlightFare, FareClass, AvailabilityStatus } from "@/types/flight-fare";
import { z } from "zod";

const flightFareSchema = z.object({
  flight_number: z.string().min(1, "Flight number is required"),
  departure_airport_code: z.string().length(3, "Must be 3-letter IATA code"),
  arrival_airport_code: z.string().length(3, "Must be 3-letter IATA code"),
  departure_time: z.string().min(1, "Departure time is required"),
  arrival_time: z.string().min(1, "Arrival time is required"),
  airline_code: z.string().min(2, "Airline code is required"),
  fare_class: z.enum(['Economy', 'Business', 'First']),
  base_price: z.number().positive("Base price must be positive"),
  taxes: z.number().nonnegative("Taxes cannot be negative"),
  availability_status: z.enum(['Available', 'Sold Out', 'Cancelled', 'Expired']),
  effective_from: z.string().optional(),
  effective_to: z.string().optional(),
});

interface FlightFareFormProps {
  fare?: FlightFare;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlightFareForm({ fare, onSuccess, onCancel }: FlightFareFormProps) {
  const [formData, setFormData] = useState<Partial<FlightFare>>(
    fare || {
      flight_number: "",
      departure_airport_code: "",
      arrival_airport_code: "",
      departure_time: "",
      arrival_time: "",
      airline_code: "",
      fare_class: "Economy",
      base_price: 0,
      taxes: 0,
      availability_status: "Available",
      effective_from: new Date().toISOString(),
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = flightFareSchema.parse({
        ...formData,
        base_price: Number(formData.base_price),
        taxes: Number(formData.taxes),
      });

      const url = fare ? `/api/flight-fares/${fare.id}` : '/api/flight-fares';
      const method = fare ? 'PUT' : 'POST';
      
      const body = fare 
        ? { ...validatedData, version: fare.version } // Optimistic locking version
        : validatedData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      onSuccess();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err instanceof Error ? err.message : "Failed to save fare" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Flight Number</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.flight_number}
            onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
            placeholder="e.g., EK202"
          />
          {errors.flight_number && <p className="text-red-500 text-xs mt-1">{errors.flight_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Airline Code</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.airline_code}
            onChange={(e) => setFormData({ ...formData, airline_code: e.target.value })}
            placeholder="e.g., EK"
          />
          {errors.airline_code && <p className="text-red-500 text-xs mt-1">{errors.airline_code}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Departure Airport (IATA)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.departure_airport_code}
            onChange={(e) => setFormData({ ...formData, departure_airport_code: e.target.value.toUpperCase() })}
            maxLength={3}
            placeholder="DXB"
          />
          {errors.departure_airport_code && <p className="text-red-500 text-xs mt-1">{errors.departure_airport_code}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Arrival Airport (IATA)</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.arrival_airport_code}
            onChange={(e) => setFormData({ ...formData, arrival_airport_code: e.target.value.toUpperCase() })}
            maxLength={3}
            placeholder="JFK"
          />
          {errors.arrival_airport_code && <p className="text-red-500 text-xs mt-1">{errors.arrival_airport_code}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Departure Time</label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.departure_time ? new Date(formData.departure_time).toISOString().slice(0, 16) : ""}
            onChange={(e) => setFormData({ ...formData, departure_time: new Date(e.target.value).toISOString() })}
          />
          {errors.departure_time && <p className="text-red-500 text-xs mt-1">{errors.departure_time}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Arrival Time</label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.arrival_time ? new Date(formData.arrival_time).toISOString().slice(0, 16) : ""}
            onChange={(e) => setFormData({ ...formData, arrival_time: new Date(e.target.value).toISOString() })}
          />
          {errors.arrival_time && <p className="text-red-500 text-xs mt-1">{errors.arrival_time}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Fare Class</label>
          <select
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.fare_class}
            onChange={(e) => setFormData({ ...formData, fare_class: e.target.value as FareClass })}
          >
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Availability Status</label>
          <select
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.availability_status}
            onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as AvailabilityStatus })}
          >
            <option value="Available">Available</option>
            <option value="Sold Out">Sold Out</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Base Price ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
          />
          {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Taxes ($)</label>
          <input
            type="number"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            value={formData.taxes}
            onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) })}
          />
          {errors.taxes && <p className="text-red-500 text-xs mt-1">{errors.taxes}</p>}
        </div>
      </div>

      {errors.submit && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{errors.submit}</p>}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : fare ? "Update Fare" : "Create Fare"}
        </button>
      </div>
    </form>
  );
}
