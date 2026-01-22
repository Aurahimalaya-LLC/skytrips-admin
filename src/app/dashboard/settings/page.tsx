"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { MediaFile } from "@/lib/media-service";
import CompanyManager from "@/components/CompanyManager";
import PaymentMethodsManager from "@/components/settings/PaymentMethodsManager";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import CurrencyTab from "@/components/dashboard/settings/CurrencyTab";
import SendEmailModal from "@/components/booking-management/SendEmailModal";
import { DEFAULT_EMAIL_TEMPLATES, EmailTemplate } from "@/lib/email-templates";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeSelector, setActiveSelector] = useState<
    "logo" | "favicon" | null
  >(null);

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

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(
    DEFAULT_EMAIL_TEMPLATES,
  );
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          companyName: data.company_name || "Curent",
          companyEmail: data.company_email || "",
          companyPhone: data.company_phone || "",
          currency: data.currency || "USD",
          dateFormat: data.date_format || "MM/DD/YYYY",
          notifications: data.notifications ?? true,
          logoUrl: data.logo_url || "",
          faviconUrl: data.favicon_url || "",
        });
        setLogoPreview(data.logo_url || null);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: settings.companyName,
          company_email: settings.companyEmail,
          company_phone: settings.companyPhone,
          currency: settings.currency,
          date_format: settings.dateFormat,
          notifications: settings.notifications,
          logo_url: settings.logoUrl,
          favicon_url: settings.faviconUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      // Optional: Show success feedback
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSave = async (data: {
    id: string;
    name: string;
    subject: string;
    content: string;
  }) => {
    // Update local state
    setEmailTemplates((prev) => {
      const exists = prev.find((t) => t.id === data.id);
      if (exists) {
        return prev.map((t) =>
          t.id === data.id
            ? { ...t, subject: data.subject, content: data.content }
            : t,
        );
      } else {
        // Create new
        return [...prev, { ...data }];
      }
    });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

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
          {[
            "Company Settings",
            "General Settings",
            "Currency",
            "Payment Methods",
            "Email Templates",
          ].map((tab) => {
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
                  {tabId === "payment" && (
                    <span className="material-symbols-outlined text-[18px]">
                      credit_card
                    </span>
                  )}
                  {tabId === "email" && (
                    <span className="material-symbols-outlined text-[18px]">
                      mail
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
                    onClick={() => setActiveSelector("logo")}
                    className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-colors cursor-pointer relative"
                  >
                    <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                      <span className="material-symbols-outlined text-[24px]">
                        photo_library
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">
                      Select from Library
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Browse available logos & icons
                    </p>
                  </div>
                </div>
              </div>

              {/* Favicon Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
                <label className="block text-sm font-bold text-foreground mb-4">
                  Favicon
                </label>
                <div className="flex items-start gap-4 mb-6">
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                    {settings.faviconUrl ? (
                      <img
                        src={settings.faviconUrl}
                        alt="Favicon"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined">diamond</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Recommended 32×32px
                    </p>
                    <button
                      onClick={() => setActiveSelector("favicon")}
                      className="text-sm font-bold text-primary hover:underline"
                    >
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

      {/* Payment Methods Tab */}
      {activeTab === "payment" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <PaymentMethodsManager />
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === "email" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                mail
              </span>
              <h2 className="text-lg font-bold text-foreground">
                Email Templates
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">
                      drafts
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTemplateId(template.id);
                      setIsEmailModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Edit Template
                  </button>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                  {template.subject}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg font-mono">
                  <span className="material-symbols-outlined text-[14px]">
                    fingerprint
                  </span>
                  <span className="truncate">{template.id}</span>
                </div>
              </div>
            ))}
          </div>

          <SendEmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            recipient={{
              name: "{NAME}",
              email: "{EMAIL}",
              organization: "{COMPANY}",
              pnr: "{PNR}",
            }}
            mode="edit"
            templates={emailTemplates}
            initialTemplateId={editingTemplateId}
            onSave={handleTemplateSave}
          />
        </div>
      )}

      {/* Currency Tab */}
      {activeTab === "currency" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <CurrencyTab />
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab === "general" && (
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
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {saving && (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <MediaSelectorModal
        isOpen={!!activeSelector}
        onClose={() => setActiveSelector(null)}
        multiple={false}
        onSelect={(file: MediaFile | MediaFile[]) => {
          const selectedFile = Array.isArray(file) ? file[0] : file;
          if (selectedFile) {
            if (activeSelector === "logo") {
              setLogoPreview(selectedFile.url || null);
              setSettings((prev) => ({
                ...prev,
                logoUrl: selectedFile.url || "",
              }));
            } else if (activeSelector === "favicon") {
              setSettings((prev) => ({
                ...prev,
                faviconUrl: selectedFile.url || "",
              }));
            }
          }
          setActiveSelector(null);
        }}
      />
    </div>
  );
}
