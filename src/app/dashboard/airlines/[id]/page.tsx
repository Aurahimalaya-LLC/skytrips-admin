"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import countryData from "../../../../../libs/shared-utils/constants/country.json";
import Link from "next/link";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import { generateSlug } from "@/lib/utils";
import RichTextEditor from "@/components/RichTextEditor";

interface FAQ {
  question: string;
  answer: string;
}

interface AirlineFormData {
  name: string;
  iata_code: string;
  description: string;
  alliance: string;
  airline_type: string;
  country: string;
  destinations_count: number;
  seo_title: string;
  meta_description: string;
  slug: string;
  faqs: FAQ[];
  logo_url: string;
  status: "Active" | "Inactive" | "Pending";
  about_fleet: string;
  in_flight_experience: string;
}

const SECTIONS = [
  { id: "general", label: "General Information", icon: "info" },
  { id: "identity", label: "Airline Identity", icon: "badge" },
  { id: "profile", label: "Airline Profile", icon: "travel_explore" },
  { id: "seo", label: "SEO & Metadata", icon: "search" },
  { id: "faqs", label: "FAQs", icon: "help" },
];

export default function EditAirlinePage() {
  const router = useRouter();
  const params = useParams();
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [formData, setFormData] = useState<AirlineFormData>({
    name: "",
    iata_code: "",
    description: "",
    alliance: "",
    airline_type: "Full-service",
    country: "United States",
    destinations_count: 0,
    seo_title: "",
    meta_description: "",
    slug: "",
    faqs: [],
    logo_url: "",
    status: "Active",
    about_fleet: "",
    in_flight_experience: "",
  });

  // FAQ State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ>({ question: "", answer: "" });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [domain, setDomain] = useState("domain.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  useEffect(() => {
    const fetchAirline = async () => {
      // Wait for params to be available
      if (!params?.id) return;

      try {
        const res = await fetch(`/api/airlines/${params.id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch airline");
        }
        const data = await res.json();
        
        // Ensure all fields are present (handle nulls from DB)
        setFormData({
          name: data.name || "",
          iata_code: data.iata_code || "",
          description: data.description || "",
          alliance: data.alliance || "",
          airline_type: data.airline_type || "Full-service",
          country: data.country || "United States",
          destinations_count: data.destinations_count || 0,
          seo_title: data.seo_title || "",
          meta_description: data.meta_description || "",
          slug: data.slug || "",
          faqs: data.faqs || [],
          logo_url: data.logo_url || "",
          status: data.status || "Active",
          about_fleet: data.about_fleet || "",
          in_flight_experience: data.in_flight_experience || "",
        });
      } catch (error) {
        console.warn("Error fetching airline:", error);
        // Don't alert immediately, maybe set an error state or redirect
        // alert("Failed to load airline data"); 
        router.push("/dashboard/airlines");
      } finally {
        setFetching(false);
      }
    };

    fetchAirline();
  }, [params, router]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug if name changes and slug was either empty or matched the old name
      if (name === "name") {
        const oldSlug = prev.slug;
        const oldNameSlug = generateSlug(prev.name);
        
        // If slug was never set, or if it matched the auto-generated version of the old name
        // (meaning the user hadn't manually customized it to something else)
        if (!oldSlug || oldSlug === oldNameSlug) {
          newData.slug = generateSlug(value);
        }
      }
      
      return newData;
    });
  };

  const handleFaqSave = () => {
    if (!currentFaq.question || !currentFaq.answer) return;

    if (editingFaqIndex !== null) {
      const newFaqs = [...formData.faqs];
      newFaqs[editingFaqIndex] = currentFaq;
      setFormData((prev) => ({ ...prev, faqs: newFaqs }));
    } else {
      setFormData((prev) => ({ ...prev, faqs: [...prev.faqs, currentFaq] }));
    }
    setIsFaqModalOpen(false);
    setCurrentFaq({ question: "", answer: "" });
    setEditingFaqIndex(null);
  };

  const deleteFaq = (index: number) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, faqs: newFaqs }));
  };

  const handleLogoSelect = (file: MediaFile | MediaFile[]) => {
    const selected = Array.isArray(file) ? file[0] : file;
    if (!selected) return;
    setFormData((prev) => ({
      ...prev,
      logo_url: selected.url || "",
    }));
    setIsMediaOpen(false);
  };

  const handleSubmit = async () => {
    if (!params?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/airlines/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update airline");
      }

      router.push("/dashboard/airlines");
    } catch (error) {
      console.error("Error updating airline:", error);
      alert("Failed to update airline. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold">Edit Airline</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update airline profile, identity, SEO and customer support
            information.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/airlines"
            className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-muted-foreground"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Update
          </button>
        </div>
      </div>

      <div className="flex gap-8 max-w-7xl mx-auto w-full">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="sticky top-6 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Form */}
        <div className="flex-1 space-y-6 pb-20">
          {/* Identity Section */}
          <section
            id="identity"
            className="bg-card border border-border rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <span className="material-symbols-outlined text-blue-400">
                  badge
                </span>
              </div>
              <h2 className="text-lg font-bold">Airline Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Airline Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                  placeholder="e.g. SkyLink International"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  IATA Code
                </label>
                <input
                  type="text"
                  name="iata_code"
                  value={formData.iata_code}
                  onChange={handleInputChange}
                  maxLength={2}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground uppercase"
                  placeholder="e.g. SL"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Logo URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="flex-1 bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="https://example.com/logo.png"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="px-3 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      photo_library
                    </span>
                    Library
                  </button>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </section>

          {/* Profile Section */}
          <section
            id="profile"
            className="bg-card border border-border rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <span className="material-symbols-outlined text-purple-400">
                  travel_explore
                </span>
              </div>
              <h2 className="text-lg font-bold">Airline Profile</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Airline Description
                </label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Describe the airline..."
                />
              </div>

              {/* About the Fleet */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  About the Fleet
                </label>
                <RichTextEditor
                  value={formData.about_fleet}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, about_fleet: value }))
                  }
                  placeholder="Describe the fleet..."
                />
              </div>

              {/* In-Flight Experience */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  In-Flight Experience
                </label>
                <RichTextEditor
                  value={formData.in_flight_experience}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      in_flight_experience: value,
                    }))
                  }
                  placeholder="Describe the in-flight experience..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Alliance
                  </label>
                  <select
                    name="alliance"
                    value={formData.alliance}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select Alliance</option>
                    <option value="Star Alliance">Star Alliance</option>
                    <option value="SkyTeam">SkyTeam</option>
                    <option value="Oneworld">Oneworld</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Airline Type
                  </label>
                  <select
                    name="airline_type"
                    value={formData.airline_type}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  >
                    <option value="Full-service">Full-service</option>
                    <option value="Low-cost">Low-cost</option>
                    <option value="Regional">Regional</option>
                    <option value="Charter">Charter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Home Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  >
                    {countryData.countries.map((c) => (
                      <option key={c.value} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Destinations
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-muted-foreground text-[20px]">
                      map
                    </span>
                    <input
                      type="number"
                      name="destinations_count"
                      value={formData.destinations_count}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Section */}
          <section
            id="seo"
            className="bg-card border border-border rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <span className="material-symbols-outlined text-blue-400">
                  search
                </span>
              </div>
              <h2 className="text-lg font-bold">SEO Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SEO Title
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {formData.seo_title.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleInputChange}
                  maxLength={60}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  placeholder="e.g. SkyLink International | Global Air Carrier"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Meta Description
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {formData.meta_description.length} / 160
                  </span>
                </div>
                <textarea
                  name="meta_description"
                  rows={3}
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  maxLength={160}
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Brief description for search results..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  URL Slug
                </label>
                <div className="flex">
                  <div className="bg-muted border border-r-0 border-input rounded-l-lg px-3 py-2.5 text-muted-foreground text-sm flex items-center">
                    {domain}/airline/
                  </div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 bg-background border border-input rounded-r-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    placeholder="skylink-international"
                  />
                </div>
                {formData.slug && (
                  <p className="mt-2 text-xs text-primary">
                    Preview: https://{domain}/airline/{formData.slug}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section
            id="faqs"
            className="bg-card border border-border rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-yellow-400">
                    help
                  </span>
                </div>
                <h2 className="text-lg font-bold">
                  Frequently Asked Questions
                </h2>
              </div>
              <button
                onClick={() => {
                  setCurrentFaq({ question: "", answer: "" });
                  setEditingFaqIndex(null);
                  setIsFaqModalOpen(true);
                }}
                className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {formData.faqs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                  No FAQs added yet.
                </div>
              ) : (
                formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 group hover:border-border/70 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-medium mb-1">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setCurrentFaq(faq);
                            setEditingFaqIndex(index);
                            setIsFaqModalOpen(true);
                          }}
                          className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => deleteFaq(index)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card text-card-foreground border border-border rounded-xl w-full max-w-lg p-6 m-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">
                {editingFaqIndex !== null ? "Edit FAQ" : "New FAQ"}
              </h3>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="text-muted-foreground hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  value={currentFaq.question}
                  onChange={(e) =>
                    setCurrentFaq({ ...currentFaq, question: e.target.value })
                  }
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  placeholder="e.g. How do I change my flight?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  Response
                </label>
                <textarea
                  rows={4}
                  value={currentFaq.answer}
                  onChange={(e) =>
                    setCurrentFaq({ ...currentFaq, answer: e.target.value })
                  }
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
                  placeholder="Provide a detailed answer..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleFaqSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium"
              >
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      <MediaSelectorModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        multiple={false}
        onSelect={handleLogoSelect}
      />
    </div>
  );
}
