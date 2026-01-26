"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Service } from "@/types";

interface ServiceFormProps {
  initialData?: Service;
  isEditMode?: boolean;
}

export default function ServiceForm({ initialData, isEditMode = false }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    type: "Primary Service",
    pricing_type: "Per Person",
    base_price: 0,
    status: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure status is boolean
        status: initialData.status === true || String(initialData.status) === 'true',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "base_price" ? parseFloat(value) : value
    }));
  };

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, status: !prev.status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && initialData?.id) {
        const { error: updateError } = await supabase
          .from("services")
          .update({
            name: formData.name,
            description: formData.description,
            type: formData.type,
            pricing_type: formData.pricing_type,
            base_price: formData.base_price,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);

        if (insertError) throw insertError;
      }

      router.push("/dashboard/services");
    } catch (err: unknown) {
      console.error("Error saving service:", err);
      setError(err instanceof Error ? err.message : "An error occurred while saving the service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 max-w-2xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Name */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Service Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Medical Travel Insurance"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="Primary Service">Primary Service</option>
              <option value="Add-on Accessory">Add-on Accessory</option>
              <option value="Insurance">Insurance</option>
              <option value="Transfer">Transfer</option>
              <option value="Meal">Meal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Pricing Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Pricing Type *
            </label>
            <select
              name="pricing_type"
              value={formData.pricing_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="Per Person">Per Person</option>
              <option value="Per Trip">Per Trip</option>
              <option value="Fixed">Fixed</option>
              <option value="Per Day">Per Day</option>
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Base Price ($) *
            </label>
            <input
              type="number"
              name="base_price"
              required
              min="0"
              step="0.01"
              value={formData.base_price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="0.00"
            />
          </div>

          {/* Status */}
          <div className="flex items-center justify-between border border-border rounded-lg px-4 py-2 bg-muted/20">
            <span className="text-sm font-medium text-foreground">Status</span>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                formData.status ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.status ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`ml-3 text-sm font-medium ${formData.status ? "text-green-600" : "text-slate-500"}`}>
              {formData.status ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="Describe the service..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                {isEditMode ? "Save Changes" : "Create Service"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
