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
    "logo" | "favicon" | "featureImage" | null
  >(null);

  // Settings State
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    notifications: true,
    logoUrl: "",
    faviconUrl: "",
    heroHeadline: "",
    heroSubtitle: "",
    featuredImage: "",
    seoTitle: "",
    metaDescription: "",
    faqs: [] as { question: string; answer: string }[],
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
          companyName: data.company_name || "Skytrips",
          companyEmail: data.company_email || "",
          companyPhone: data.company_phone || "",
          currency: data.currency || "USD",
          dateFormat: data.date_format || "MM/DD/YYYY",
          notifications: data.notifications ?? true,
          logoUrl: data.logo_url || "",
          faviconUrl: data.favicon_url || "",
          heroHeadline: data.hero_headline || "",
          heroSubtitle: data.hero_subtitle || "",
          featuredImage: data.featured_image || "",
          seoTitle: data.seo_title || "",
          metaDescription: data.meta_description || "",
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
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
          hero_headline: settings.heroHeadline,
          hero_subtitle: settings.heroSubtitle,
          featured_image: settings.featuredImage,
          seo_title: settings.seoTitle,
          meta_description: settings.metaDescription,
          faqs: settings.faqs,
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
          {/* Company Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="material-symbols-outlined text-primary">
                storefront
              </span>
              <h2 className="text-lg font-bold text-foreground">
                Company Information
              </h2>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) =>
                      setSettings({ ...settings, companyName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    Company Email
                  </label>
                  <input
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, companyEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Enter company email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.companyPhone}
                    onChange={(e) =>
                      setSettings({ ...settings, companyPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Enter company phone"
                  />
                </div>
              </div>
            </div>
          </div>

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
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <span className="material-symbols-outlined text-primary">tune</span>
            <h2 className="text-lg font-bold text-foreground">General Settings</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Hero Headline</label>
                <input
                  type="text"
                  value={settings.heroHeadline}
                  onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Enter homepage hero headline"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Hero Sub-title</label>
                <input
                  type="text"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Enter hero sub-title"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-foreground">Featured Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={settings.featuredImage}
                    onChange={(e) => setSettings({ ...settings, featuredImage: e.target.value })}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Select image from media library"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveSelector("featureImage")}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-bold"
                  >
                    Select Media
                  </button>
                </div>
                {settings.featuredImage && (
                  <div className="mt-3">
                    <img src={settings.featuredImage} alt="Featured" className="h-28 rounded-lg border border-border object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">SEO Title</label>
                <input
                  type="text"
                  value={settings.seoTitle}
                  onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="Enter SEO title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Meta Description</label>
                <textarea
                  value={settings.metaDescription}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-y"
                  placeholder="Enter meta description"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="material-symbols-outlined text-primary">help</span>
              <h2 className="text-lg font-bold text-foreground">FAQs</h2>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                {settings.faqs.map((faq, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border border-border">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const faqs = [...settings.faqs];
                        faqs[index] = { ...faqs[index], question: e.target.value };
                        setSettings({ ...settings, faqs });
                      }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const faqs = [...settings.faqs];
                        faqs[index] = { ...faqs[index], answer: e.target.value };
                        setSettings({ ...settings, faqs });
                      }}
                      rows={2}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-y"
                      placeholder="Answer"
                    />
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const faqs = settings.faqs.filter((_, i) => i !== index);
                          setSettings({ ...settings, faqs });
                        }}
                        className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {settings.faqs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No FAQs added yet.</p>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, faqs: [...settings.faqs, { question: "", answer: "" }] })}
                    className="text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10"
                  >
                    + Add FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            } else if (activeSelector === "featureImage") {
              setSettings((prev) => ({
                ...prev,
                featuredImage: selectedFile.url || "",
              }));
            }
          }
          setActiveSelector(null);
        }}
      />
    </div>
  );
}
