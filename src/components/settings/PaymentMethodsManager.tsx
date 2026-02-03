"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type PaymentMethod = {
  id: string;
  type: "credit_card" | "paypal" | "bank_transfer";
  name: string; // e.g., "Visa ending in 4242"
  details: string; // e.g., "**** 4242" or email
  expiry?: string;
  isDefault: boolean;
  icon: string;
};

export default function PaymentMethodsManager() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null); // ID or 'new'
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({ type: "credit_card" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch methods from Supabase
  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         // If no user, we might be in a dev mode without auth, keep empty or mock? 
         // For now, let's return to avoid errors if RLS is on.
         setLoading(false);
         return;
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) {
        // If table doesn't exist yet, ignore (or log)
        console.error("Error fetching payment methods:", error);
      } else if (data) {
        setMethods(data.map((m) => ({
          id: m.id,
          type: m.type as PaymentMethod["type"],
          name: m.name,
          details: m.details,
          expiry: m.expiry,
          isDefault: m.is_default,
          icon: m.type === "paypal" ? "account_balance_wallet" : m.type === "bank_transfer" ? "account_balance" : "credit_card",
        })));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing("new");
    setFormData({ type: "credit_card", isDefault: false });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (method: PaymentMethod) => {
    setIsEditing(method.id);
    setFormData(method);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;

    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMethods(methods.filter((m) => m.id !== id));
      setSuccess("Payment method removed successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use RPC for atomic update
      const { error } = await supabase.rpc('set_default_payment_method', { 
        method_id: id 
      });

      if (error) throw error;

      setMethods(
        methods.map((m) => ({
          ...m,
          isDefault: m.id === id,
        }))
      );
      setSuccess("Default payment method updated.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!formData.name || !formData.details) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.type === "credit_card" && !formData.expiry) {
        setError("Expiry date is required for credit cards.");
        return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to save payment methods.");

      const payload = {
        user_id: user.id,
        type: formData.type,
        name: formData.name,
        details: formData.details,
        expiry: formData.expiry,
        is_default: formData.isDefault || (methods.length === 0), // Default if first
        // icon is derived
      };

      if (isEditing === "new") {
        const { data, error } = await supabase
          .from("payment_methods")
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
           const newMethod: PaymentMethod = {
             id: data.id,
             type: data.type,
             name: data.name,
             details: data.details,
             expiry: data.expiry,
             isDefault: data.is_default,
             icon: data.type === "paypal" ? "account_balance_wallet" : data.type === "bank_transfer" ? "account_balance" : "credit_card",
           };
           setMethods([...methods, newMethod]);
           setSuccess("Payment method added successfully.");
        }
      } else {
        const { error } = await supabase
          .from("payment_methods")
          .update(payload)
          .eq("id", isEditing);

        if (error) throw error;

        setMethods(
          methods.map((m) =>
            m.id === isEditing
              ? { ...m, ...formData, isDefault: formData.isDefault || m.isDefault } as PaymentMethod
              : m
          )
        );
        setSuccess("Payment method updated successfully.");
      }
      setIsEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save payment method");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-bold text-foreground">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">Manage your payment methods for billing and transactions.</p>
            </div>
            <button 
                onClick={handleAddNew}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Method
            </button>
        </div>

        {/* Feedback Messages */}
        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
            </div>
        )}
        {success && (
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {success}
            </div>
        )}

        {/* List of Methods */}
        <div className="grid grid-cols-1 gap-4">
            {methods.map((method) => (
                <div 
                    key={method.id} 
                    className={`bg-card border rounded-xl p-4 flex items-center gap-4 transition-all ${method.isDefault ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                    <div className="size-12 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                         <span className="material-symbols-outlined text-[24px]">{method.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-foreground truncate">{method.name}</h4>
                            {method.isDefault && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Default</span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{method.details} {method.expiry && <span className="text-xs ml-2 opacity-75">Exp: {method.expiry}</span>}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!method.isDefault && (
                            <button 
                                onClick={() => handleSetDefault(method.id)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors text-xs font-bold"
                                title="Set as Default"
                            >
                                Set Default
                            </button>
                        )}
                        <button 
                            onClick={() => handleEdit(method)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                        >
                             <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                            onClick={() => handleDelete(method.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                            title="Remove"
                        >
                             <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </div>
            ))}

            {methods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                    No payment methods added yet.
                </div>
            )}
        </div>

        {/* Add/Edit Modal (Inline for simplicity) */}
        {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">
                            {isEditing === 'new' ? 'Add Payment Method' : 'Edit Payment Method'}
                        </h3>
                        <button onClick={() => setIsEditing(null)} className="text-muted-foreground hover:text-foreground">
                             <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1">Type</label>
                            <select 
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="credit_card">Credit Card</option>
                                <option value="paypal">PayPal</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-foreground mb-1">Name / Label</label>
                            <input 
                                type="text"
                                placeholder={formData.type === 'credit_card' ? "e.g. Corporate Visa" : "e.g. Business PayPal"}
                                value={formData.name || ''}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {formData.type === 'credit_card' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-bold text-foreground mb-1">Card Number (Last 4 digits visible)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground">
                                            <span className="material-symbols-outlined text-[18px]">credit_card</span>
                                        </span>
                                        <input 
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            value={formData.details || ''}
                                            onChange={(e) => setFormData({...formData, details: e.target.value})}
                                            className="w-full h-10 pl-10 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">lock</span>
                                        Encrypted & Secure
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-1">Expiry</label>
                                        <input 
                                            type="text"
                                            placeholder="MM/YY"
                                            value={formData.expiry || ''}
                                            onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-foreground mb-1">CVC</label>
                                        <input 
                                            type="password"
                                            placeholder="***"
                                            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">
                                    {formData.type === 'paypal' ? 'PayPal Email' : 'Account Details'}
                                </label>
                                <input 
                                    type="text"
                                    placeholder={formData.type === 'paypal' ? "email@example.com" : "IBAN / Swift"}
                                    value={formData.details || ''}
                                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        )}

                        {error && (
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        )}
                    </div>

                    <div className="p-6 bg-muted/30 border-t border-border flex justify-end gap-3">
                        <button 
                            onClick={() => setIsEditing(null)}
                            className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                        >
                            Save Method
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
