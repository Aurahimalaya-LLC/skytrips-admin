"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Route } from "@/types/route";
import { RouteMultiSelect } from "@/components/RouteMultiSelect";
import { AirportSelect } from "@/components/airports/AirportSelect";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/Accordion";

interface RouteFormProps {
  initialData?: Partial<Route>;
  isEdit?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function RouteForm({ initialData, isEdit }: RouteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Route>>({
    departure_airport: "",
    arrival_airport: "",
    other_popular_routes: [],
    
    // Hero Section
    hero_headline: "",
    hero_subtitle: "",

    // Route Info
    average_flight_time: "",
    distance: "",
    cheapest_month: "",
    daily_flights: undefined,

    // Media & Description
    featured_image: "",
    description: "",

    // FAQs
    faqs: [],

    // SEO
    seo_title: "",
    meta_description: "",
    slug: "",
    canonical_url: "",
    schema_markup: "",
    robots_meta: {
      no_index: false,
      no_follow: false,
      no_archive: false,
      no_image_index: false,
      no_snippet: false,
    },

    ...initialData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRobotsChange = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      robots_meta: {
        ...prev.robots_meta,
        [key]: !prev.robots_meta?.[key as keyof typeof prev.robots_meta],
      },
    }));
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }],
    }));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    setFormData((prev) => {
      const newFaqs = [...(prev.faqs || [])];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return { ...prev, faqs: newFaqs };
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs?.filter((_, i) => i !== index),
    }));
  };

  // Auto-generate slug if not manually edited or if empty
  useEffect(() => {
    if (formData.departure_airport && formData.arrival_airport) {
      const dep = formData.departure_airport.toLowerCase();
      const arr = formData.arrival_airport.toLowerCase();
      const suggestedSlug = `flights/from-${dep}-to-${arr}`;
      
      // Only update if slug is empty or matches the pattern (user hasn't customized it yet)
      // Or if the user wants auto-updates. For now, let's update if empty or it looks auto-generated.
      // A simple heuristic: if the current slug is empty or starts with "flights/from-", update it.
      if (!formData.slug || formData.slug.startsWith("flights/from-")) {
        setFormData(prev => ({ ...prev, slug: suggestedSlug }));
      }
    }
  }, [formData.departure_airport, formData.arrival_airport]);

  const handleMediaSelect = (file: MediaFile | MediaFile[]) => {
    if (Array.isArray(file)) return; // Should be single select
    
    const url = file.url || file.file_path; 
    setFormData((prev) => ({ ...prev, featured_image: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        daily_flights: formData.daily_flights ? Number(formData.daily_flights) : null,
      };

      if (isEdit && initialData?.id) {
        const { error } = await supabase
          .from("routes")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("routes").insert([payload]);
        if (error) throw error;
      }

      router.push("/dashboard/routes");
      router.refresh();
    } catch (error) {
      console.error("Error saving route:", error);
      alert("Error saving route: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          {isEdit ? "Edit Route Details" : "New Route Details"}
        </h2>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <AirportSelect
              label="Departure Airport (IATA)"
              value={formData.departure_airport || ""}
              onChange={(val) => setFormData((prev) => ({ ...prev, departure_airport: val }))}
              required
              placeholder="Search by code, city or name..."
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <AirportSelect
              label="Arrival Airport (IATA)"
              value={formData.arrival_airport || ""}
              onChange={(val) => setFormData((prev) => ({ ...prev, arrival_airport: val }))}
              required
              placeholder="Search by code, city or name..."
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={["hero", "route-info"]} className="w-full">
          {/* Hero Section */}
          <AccordionItem value="hero">
            <AccordionTrigger>Hero Section</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    name="hero_headline"
                    value={formData.hero_headline || ""}
                    onChange={handleChange}
                    placeholder="e.g. Cheap Flights to London"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hero Sub-title
                  </label>
                  <input
                    type="text"
                    name="hero_subtitle"
                    value={formData.hero_subtitle || ""}
                    onChange={handleChange}
                    placeholder="e.g. Book now and save big on your next trip"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Route Information */}
          <AccordionItem value="route-info">
            <AccordionTrigger>Route Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Average Flight Time
                  </label>
                  <input
                    type="text"
                    name="average_flight_time"
                    value={formData.average_flight_time || ""}
                    onChange={handleChange}
                    placeholder="e.g. 2h 30m"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Distance
                  </label>
                  <input
                    type="text"
                    name="distance"
                    value={formData.distance || ""}
                    onChange={handleChange}
                    placeholder="e.g. 1,200 km"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cheapest Month(s)
                  </label>
                  <div className="border border-slate-300 rounded-lg p-2 max-h-48 overflow-y-auto">
                    {MONTHS.map((month) => (
                      <label key={month} className="flex items-center gap-2 py-1 px-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.cheapest_month || "").split(",").map(m => m.trim()).filter(Boolean).includes(month)}
                          onChange={(e) => {
                            const currentMonths = (formData.cheapest_month || "").split(",").map(m => m.trim()).filter(Boolean);
                            let newMonths;
                            if (e.target.checked) {
                              newMonths = [...currentMonths, month];
                            } else {
                              newMonths = currentMonths.filter(m => m !== month);
                            }
                            // Sort by month index to keep order consistent
                            newMonths.sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
                            setFormData(prev => ({ ...prev, cheapest_month: newMonths.join(",") }));
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{month}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Select one or more months</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Daily Flights
                  </label>
                  <input
                    type="number"
                    name="daily_flights"
                    value={formData.daily_flights || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Media & Description */}
          <AccordionItem value="media">
            <AccordionTrigger>Media & Description</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Featured Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      name="featured_image"
                      value={formData.featured_image || ""}
                      onChange={handleChange}
                      placeholder="Select image from media library"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Select Media
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter route description..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* FAQs Section */}
          <AccordionItem value="faqs">
            <AccordionTrigger>FAQs</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-slate-700">Frequently Asked Questions</h4>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Add FAQ
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.faqs?.map((faq, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                          placeholder="Question"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                          placeholder="Answer"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y"
                        />
                      </div>
                    </div>
                  ))}
                  {(!formData.faqs || formData.faqs.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No FAQs added yet.</p>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SEO Section */}
          <AccordionItem value="seo">
            <AccordionTrigger>SEO Settings</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seo_title"
                    value={formData.seo_title || ""}
                    onChange={handleChange}
                    placeholder="SEO Title"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Meta Description"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Slug
                    </label>
                    <div className="flex rounded-lg shadow-sm border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                      <span className="flex select-none items-center px-3 text-slate-500 bg-slate-50 border-r border-slate-300 text-sm">
                        flights/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug?.startsWith("flights/") ? formData.slug.slice(8) : formData.slug || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: `flights/${e.target.value}` }))}
                        placeholder="from-jfk-to-lhr"
                        className="flex-1 block w-full px-4 py-2 bg-white border-0 focus:ring-0 outline-none text-slate-900 placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      name="canonical_url"
                      value={formData.canonical_url || ""}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Schema Markup (JSON-LD)
                  </label>
                  <textarea
                    name="schema_markup"
                    value={formData.schema_markup || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder='{"@context": "https://schema.org", ...}'
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Robots Meta Tag Settings
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: "no_index", label: "No Index" },
                      { key: "no_follow", label: "No Follow" },
                      { key: "no_archive", label: "No Archive" },
                      { key: "no_image_index", label: "No Image Index" },
                      { key: "no_snippet", label: "No Snippet" },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!formData.robots_meta?.[item.key as keyof typeof formData.robots_meta]}
                          onChange={() => handleRobotsChange(item.key)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Related Routes Section */}
          <AccordionItem value="related">
            <AccordionTrigger>Related</AccordionTrigger>
            <AccordionContent>
              <div className="pt-2">
                <div className="col-span-2">
                  <RouteMultiSelect
                    label="Other Popular Routes"
                    value={formData.other_popular_routes || []}
                    onChange={(val) => setFormData((prev) => ({ ...prev, other_popular_routes: val }))}
                    excludeIds={isEdit && initialData?.id ? [initialData.id] : []}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Select other routes that are popular or related to this one.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg mr-3 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Route" : "Create Route"}
          </button>
        </div>
      </div>
      
      <MediaSelectorModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
      />
    </form>
  );
}
