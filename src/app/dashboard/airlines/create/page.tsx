"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import countryData from "../../../../../libs/shared-utils/constants/country.json";
import Link from "next/link";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import { generateSlug } from "@/lib/utils";

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
}

const SECTIONS = [
  { id: "general", label: "General Information", icon: "info" },
  { id: "identity", label: "Airline Identity", icon: "badge" },
  { id: "profile", label: "Airline Profile", icon: "travel_explore" },
  { id: "seo", label: "SEO & Metadata", icon: "search" },
  { id: "faqs", label: "FAQs", icon: "help" },
];

export default function CreateAirlinePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(false);
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
  });

  // FAQ State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ>({ question: "", answer: "" });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [domain, setDomain] = useState("domain.com");

  const descriptionEditorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

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

  const handleDescriptionInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const applyDescriptionFormat = (command: "bold" | "italic" | "underline") => {
    document.execCommand(command, false);
    if (descriptionEditorRef.current) {
      descriptionEditorRef.current.focus();
    }
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
    setLoading(true);
    try {
      const res = await fetch("/api/airlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create airline");
      }

      router.push("/dashboard/airlines");
    } catch (error) {
      console.error("Error creating airline:", error);
      alert("Failed to create airline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Airline</h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure airline profile, identity, SEO and customer support
            information.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/airlines"
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-sm">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            Save
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
                    ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
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
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <span className="material-symbols-outlined text-blue-400">
                  badge
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Airline Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Airline Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                  placeholder="e.g. SkyLink International"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  IATA Code
                </label>
                <input
                  type="text"
                  name="iata_code"
                  value={formData.iata_code}
                  onChange={handleInputChange}
                  maxLength={2}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 uppercase"
                  placeholder="e.g. SL"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Logo URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                    placeholder="https://example.com/logo.png"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaOpen(true)}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      photo_library
                    </span>
                    Library
                  </button>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
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
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <span className="material-symbols-outlined text-purple-400">
                  travel_explore
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Airline Profile</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Airline Description
                </label>
                <div className="relative">
                  <div className="absolute top-2 left-2 flex gap-1 p-1 bg-gray-800 rounded border border-gray-700">
                    <button
                      className="p-1 hover:bg-gray-700 rounded text-gray-400"
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyDescriptionFormat("bold");
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        format_bold
                      </span>
                    </button>
                    <button
                      className="p-1 hover:bg-gray-700 rounded text-gray-400"
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyDescriptionFormat("italic");
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        format_italic
                      </span>
                    </button>
                    <button
                      className="p-1 hover:bg-gray-700 rounded text-gray-400"
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyDescriptionFormat("underline");
                      }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        format_underlined
                      </span>
                    </button>
                  </div>
                  {!formData.description && (
                    <div className="pointer-events-none absolute left-4 right-4 top-12 text-gray-600 text-sm">
                      Describe the airline...
                    </div>
                  )}
                  <div
                    ref={descriptionEditorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleDescriptionInput}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 pt-12 pb-2.5 text-sm text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all min-h-[160px] whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: formData.description || "",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Alliance
                  </label>
                  <select
                    name="alliance"
                    value={formData.alliance}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="">Select Alliance</option>
                    <option value="Star Alliance">Star Alliance</option>
                    <option value="SkyTeam">SkyTeam</option>
                    <option value="Oneworld">Oneworld</option>
                    <option value="None">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Airline Type
                  </label>
                  <select
                    name="airline_type"
                    value={formData.airline_type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="Full-service">Full-service</option>
                    <option value="Low-cost">Low-cost</option>
                    <option value="Regional">Regional</option>
                    <option value="Charter">Charter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Home Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                  >
                    {countryData.countries.map((c) => (
                      <option key={c.value} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Destinations
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-[20px]">
                      map
                    </span>
                    <input
                      type="number"
                      name="destinations_count"
                      value={formData.destinations_count}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
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
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <span className="material-symbols-outlined text-blue-400">
                  search
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">SEO Settings</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    SEO Title
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.seo_title.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleInputChange}
                  maxLength={60}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. SkyLink International | Global Air Carrier"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Meta Description
                  </label>
                  <span className="text-xs text-gray-500">
                    {formData.meta_description.length} / 160
                  </span>
                </div>
                <textarea
                  name="meta_description"
                  rows={3}
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  maxLength={160}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Brief description for search results..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  URL Slug
                </label>
                <div className="flex">
                  <div className="bg-gray-800 border border-r-0 border-gray-700 rounded-l-lg px-3 py-2.5 text-gray-500 text-sm flex items-center">
                    {domain}/airline/
                  </div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-r-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                    placeholder="skylink-international"
                  />
                </div>
                {formData.slug && (
                  <p className="mt-2 text-xs text-blue-400">
                    Preview: https://domain.com/airline/{formData.slug}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* FAQs Section */}
          <section
            id="faqs"
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 scroll-mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <span className="material-symbols-outlined text-yellow-400">
                    help
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">
                  Frequently Asked Questions
                </h2>
              </div>
              <button
                onClick={() => {
                  setCurrentFaq({ question: "", answer: "" });
                  setEditingFaqIndex(null);
                  setIsFaqModalOpen(true);
                }}
                className="px-3 py-1.5 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add FAQ
              </button>
            </div>

            <div className="space-y-3">
              {formData.faqs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg text-gray-500 text-sm">
                  No FAQs added yet.
                </div>
              ) : (
                formData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 group hover:border-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-gray-400">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setCurrentFaq(faq);
                            setEditingFaqIndex(index);
                            setIsFaqModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => deleteFaq(index)}
                          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg p-6 m-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingFaqIndex !== null ? "Edit FAQ" : "New FAQ"}
              </h3>
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  value={currentFaq.question}
                  onChange={(e) =>
                    setCurrentFaq({ ...currentFaq, question: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                  placeholder="e.g. How do I change my flight?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Response
                </label>
                <textarea
                  rows={4}
                  value={currentFaq.answer}
                  onChange={(e) =>
                    setCurrentFaq({ ...currentFaq, answer: e.target.value })
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none"
                  placeholder="Provide a detailed answer..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleFaqSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
