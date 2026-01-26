"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Service, ServiceOption } from "@/types";

interface ServiceFormProps {
  initialData?: Service;
  isEditMode?: boolean;
}

export default function ServiceForm({ initialData, isEditMode = false }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Preview state
  const [previewSelected, setPreviewSelected] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Service>({
    name: "",
    description: "",
    type: "Primary Service",
    pricing_type: "Per Person",
    base_price: 0,
    status: true,
    options: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure status is boolean
        status: initialData.status === true || String(initialData.status) === 'true',
        options: initialData.options || [],
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

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), { name: "", price: 0 }]
    }));
  };

  const updateOption = (index: number, field: keyof ServiceOption, value: string | number) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = {
      ...newOptions[index],
      [field]: field === 'price' ? parseFloat(value as string) : value
    };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
    // Also remove from preview if selected
    setPreviewSelected(prev => prev.filter(i => i !== index));
  };

  const togglePreviewOption = (index: number) => {
    setPreviewSelected(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const calculatePreviewTotal = () => {
    const base = formData.base_price || 0;
    const optionsTotal = previewSelected.reduce((sum, index) => {
      return sum + (formData.options?.[index]?.price || 0);
    }, 0);
    return base + optionsTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        pricing_type: formData.pricing_type,
        base_price: formData.base_price,
        status: formData.status,
        options: formData.options,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode && initialData?.id) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert([{
            ...payload,
            created_at: new Date().toISOString(),
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

          {/* Meal Options Configuration */}
          {formData.type === "Meal" && (
            <div className="col-span-2 space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Meal Options / Add-ons</h3>
                <button
                  type="button"
                  onClick={addOption}
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Option
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.options?.map((option, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Option Name (e.g. Extra Cheese)"
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Price"
                        min="0"
                        step="0.01"
                        value={option.price}
                        onChange={(e) => updateOption(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
                {(!formData.options || formData.options.length === 0) && (
                  <p className="text-xs text-muted-foreground italic">No options added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Preview Section */}
          {formData.type === "Meal" && (formData.options?.length || 0) > 0 && (
            <div className="col-span-2 mt-4 bg-muted/30 p-4 rounded-xl border border-border">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                Preview & Price Calculation
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base Meal Price:</span>
                  <span className="font-mono font-medium">${formData.base_price.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 py-2 border-y border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Select Options to Test:</p>
                  {formData.options?.map((option, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={previewSelected.includes(index)}
                          onChange={() => togglePreviewOption(index)}
                          className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4"
                        />
                        <span>{option.name || "Untitled Option"}</span>
                      </label>
                      <span className="font-mono text-muted-foreground">+${option.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-foreground">Total Price:</span>
                  <div className="text-right">
                     <span className="block font-mono font-bold text-lg text-primary">
                       ${calculatePreviewTotal().toFixed(2)}
                     </span>
                     <span className="text-xs text-muted-foreground">
                       (Base + Selected Options)
                     </span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
