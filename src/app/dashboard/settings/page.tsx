"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import CompanyManager from "@/components/CompanyManager";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLogoSelectorOpen, setIsLogoSelectorOpen] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    companyName: "Curent",
    companyEmail: "",
    companyPhone: "",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    notifications: true,
    logoUrl: "",
    faviconUrl: "",
  });

  useEffect(() => {
    // In a real app, fetch settings from DB
    // fetchSettings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your company profile, general preferences, and currency
          settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-8" aria-label="Tabs">
          {["Company Settings", "General Settings", "Currency"].map((tab) => {
            const tabId = tab.toLowerCase().split(" ")[0];
            const isActive = activeTab === tabId;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabId)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tabId === "company" && (
                    <span className="material-symbols-outlined text-[18px]">
                      business
                    </span>
                  )}
                  {tabId === "general" && (
                    <span className="material-symbols-outlined text-[18px]">
                      tune
                    </span>
                  )}
                  {tabId === "currency" && (
                    <span className="material-symbols-outlined text-[18px]">
                      payments
                    </span>
                  )}
                  {tab}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "company" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Logo & Icon Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="material-symbols-outlined text-primary">
                image
              </span>
              <h2 className="text-lg font-bold text-foreground">Logo & Icon</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Company Logo Card */}
              <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                <label className="block text-sm font-bold text-foreground mb-4">
                  Company Logo
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Preview Area */}
                  <div className="aspect-video bg-[#5a6b5d] rounded-lg flex items-center justify-center relative overflow-hidden group">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-24 w-auto object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-white/50 text-5xl mb-2">
                          spa
                        </span>
                        <p className="text-white font-serif text-xl tracking-widest">
                          CURENT
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Selection Area */}
                  <div 
                    onClick={() => setIsLogoSelectorOpen(true)}
                    className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-colors cursor-pointer relative"
                  >
                    <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                        <span className="material-symbols-outlined text-[24px]">photo_library</span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">Select from Library</p>
                    <p className="text-xs text-muted-foreground">Browse available logos & icons</p>
                  </div>
                </div>
              </div>

              {/* Favicon Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
                <label className="block text-sm font-bold text-foreground mb-4">
                  Favicon
                </label>
                <div className="flex items-start gap-4 mb-6">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined">diamond</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Recommended 32×32px
                    </p>
                    <button className="text-sm font-bold text-primary hover:underline">
                      Update
                    </button>
                  </div>
                </div>

                <div className="mt-auto bg-muted/50 rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground block mb-1">
                      Tip:
                    </span>
                    Your logo appears on invoices, while the favicon is used in
                    browser tabs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Profiles Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="material-symbols-outlined text-primary">
                domain
              </span>
              <h2 className="text-lg font-bold text-foreground">
                Company Profiles
              </h2>
            </div>
            <CompanyManager />
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "company" && (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl border-dashed">
          <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">
            construction
          </span>
          <h3 className="text-lg font-bold text-foreground">
            Work in Progress
          </h3>
          <p className="text-muted-foreground">
            This section is currently under development.
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="bottom-6 flex justify-end gap-4">
        <button className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          Discard Changes
        </button>
        <button className="px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Settings
        </button>
      </div>

      <MediaSelectorModal 
        isOpen={isLogoSelectorOpen} 
        onClose={() => setIsLogoSelectorOpen(false)}
        onSelect={(file) => {
          setLogoPreview(file.url || null);
          setSettings(prev => ({ ...prev, logoUrl: file.url || "" }));
          setIsLogoSelectorOpen(false);
        }}
      />
    </div>
  );
}