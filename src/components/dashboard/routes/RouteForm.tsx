"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Route } from "@/types/route";
import { RouteMultiSelect } from "@/components/RouteMultiSelect";
import { AirportSelect } from "@/components/airports/AirportSelect";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import { transformRouteInfoData } from "@/utils/transformRouteInfoData";
import { transformHeroData } from "@/utils/transformHeroData";
import { routeInfoSchema } from "@/lib/schemas/route";
import HeroPreview from "./HeroPreview";

import RichTextDescription from "./RichTextDescription";

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  // Get active slide from URL, default to 0
  const activeSlideIndex = parseInt(searchParams.get('hero_slide') || '0', 10);
  
  const [formData, setFormData] = useState<Partial<Route>>({
    departure_airport: "",
    arrival_airport: "",
    other_popular_routes: [],
    
    // Hero Section
    hero_headline: "",
    hero_subtitle: "",
    hero_sections: [],

    // Route Info (JSONB)
    route_info: {
      average_flight_time: "",
      distance: "",
      cheapest_month: "",
      daily_flights: undefined,
    },

    // Things to Note
    things_to_note_origin_airport: "",
    things_to_note_time_diff: "",
    things_to_note_currency: "",
    things_to_note_power_plugs: "",

    // Travel Guide
    travel_guide_heading: "",
    travel_guide_description: "",
    travel_guide_image: "",
    travel_guide_tags: [],
    travel_guide_places: "",
    travel_guide_getting_around: "",

    // Content Section (JSONB)
    content_sections: {
      title: "",
      description: "",
      best_time: "",
      duration_stopovers: "",
    },

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
    seo_settings: {
      title: "",
      description: "",
      canonical_url: "",
      schema_markup: "",
      robots: {
        no_index: false,
        no_follow: false,
        no_archive: false,
        no_image_index: false,
        no_snippet: false,
      }
    },

    ...initialData,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentSectionChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      content_sections: {
        ...(prev.content_sections || {}),
        [field]: value
      }
    }));
  };

  const handleRouteInfoChange = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData((prev) => ({
      ...prev,
      route_info: {
        ...prev.route_info,
        [field]: value
      }
    }));
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

  const handleSeoChange = (field: string, value: string | number | boolean | null | undefined) => {
    setFormData((prev) => ({
      ...prev,
      seo_settings: {
        ...(prev.seo_settings || {}),
        [field]: value
      }
    }));
  };

  const handleSeoRobotsChange = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      seo_settings: {
        ...(prev.seo_settings || {}),
        robots: {
          ...(prev.seo_settings?.robots || {}),
          [key]: !prev.seo_settings?.robots?.[key as keyof typeof prev.seo_settings.robots],
        }
      }
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

  const updateActiveSlide = (index: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('hero_slide', index.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleAddHeroSection = () => {
    setFormData((prev) => {
      const newSections = [...(prev.hero_sections || []), { headline: "", subtitle: "" }];
      // Switch to the new slide immediately
      updateActiveSlide(newSections.length - 1);
      return { ...prev, hero_sections: newSections };
    });
  };

  const handleHeroSectionChange = (index: number, field: "headline" | "subtitle" | "cta_text" | "cta_url", value: string) => {
    setFormData((prev) => {
      const newSections = [...(prev.hero_sections || [])];
      newSections[index] = { ...newSections[index], [field]: value };
      return { ...prev, hero_sections: newSections };
    });
  };

  const handleRemoveHeroSection = (index: number) => {
    setFormData((prev) => {
      const newSections = prev.hero_sections?.filter((_, i) => i !== index) || [];
      // Adjust active slide if needed
      if (activeSlideIndex >= newSections.length && newSections.length > 0) {
         updateActiveSlide(newSections.length - 1);
      } else if (newSections.length === 0) {
         updateActiveSlide(0);
      }
      return { ...prev, hero_sections: newSections };
    });
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

  const handleMediaSelect = (file: MediaFile | MediaFile[], targetField: "featured_image" | "travel_guide_image" = "featured_image") => {
    if (Array.isArray(file)) return; // Should be single select
    
    const url = file.url || file.file_path; 
    setFormData((prev) => ({ ...prev, [targetField]: url }));
  };

  const [activeMediaField, setActiveMediaField] = useState<"featured_image" | "travel_guide_image">("featured_image");

  const openMediaModal = (field: "featured_image" | "travel_guide_image") => {
    setActiveMediaField(field);
    setIsMediaModalOpen(true);
  };

  const handleMediaSelectWrapper = (file: MediaFile | MediaFile[]) => {
    handleMediaSelect(file, activeMediaField);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        route_info: {
          ...formData.route_info,
          daily_flights: formData.route_info?.daily_flights ? Number(formData.route_info.daily_flights) : null,
        }
      };

      console.log("Submitting payload:", JSON.stringify(payload, null, 2));

      // Route Info is now handled as a JSONB object directly in the payload
      // No need for transformRouteInfoData unless we are validating or transforming specific fields.
      // The database trigger will handle validation.
      
      // Client-side Validation using Zod - REMOVED per user request to allow flexible inputs
      /*
      if (formData.route_info) {
        const validation = routeInfoSchema.safeParse(formData.route_info);
        if (!validation.success) {
           const errors = validation.error.format();
           const errorMessages = [];
           if (errors.average_flight_time?._errors) errorMessages.push(`Average Flight Time: ${errors.average_flight_time._errors.join(", ")}`);
           if (errors.distance?._errors) errorMessages.push(`Distance: ${errors.distance._errors.join(", ")}`);
           if (errors.cheapest_month?._errors) errorMessages.push(`Cheapest Month: ${errors.cheapest_month._errors.join(", ")}`);
           if (errors.daily_flights?._errors) errorMessages.push(`Daily Flights: ${errors.daily_flights._errors.join(", ")}`);
           
           if (errorMessages.length > 0) {
             alert("Validation Error:\n" + errorMessages.join("\n"));
             setLoading(false);
             return;
           }
        }
      }
      */

      if (isEdit && initialData?.id) {
        // Use the API endpoint for updates to ensure consistency and extra server-side checks
        const response = await fetch(`/api/routes/${initialData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || "Failed to update route via API");
        }
      } else {
        // Use the API endpoint for creation to ensure consistency, validation, and slug generation
        const response = await fetch('/api/routes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || "Failed to create route via API");
        }
      }

      router.push("/dashboard/routes");
      router.refresh();
    } catch (error) {
      console.error("Error saving route:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      const errorMessage = 
        (error as { message?: string })?.message || 
        (error as { details?: string })?.details || 
        JSON.stringify(error) || 
        "Unknown error";
        
      alert("Error saving route: " + errorMessage);
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

        {/* Hero Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Hero Section</h3>
            <button
              type="button"
              onClick={handleAddHeroSection}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add Slide
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Slide Navigation Tabs */}
            {formData.hero_sections && formData.hero_sections.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 mb-4">
                {formData.hero_sections.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => updateActiveSlide(index)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeSlideIndex === index
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    Slide {index + 1}
                  </button>
                ))}
              </div>
            )}

            {formData.hero_sections?.map((section, index) => {
              // Only render active slide
              if (index !== activeSlideIndex) return null;

              return (
              <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative animate-in fade-in duration-200">
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider py-1">
                    Slide {index + 1} of {formData.hero_sections?.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHeroSection(index)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                    title="Remove Slide"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mt-6">
                  {/* Live Preview */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-500 mb-2">Live Preview</label>
                    <HeroPreview 
                      headline={section.headline}
                      subtitle={section.subtitle}
                      ctaText={section.cta_text}
                      ctaUrl={section.cta_url}
                      backgroundImage={formData.featured_image}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Headline</label>
                    <input
                      type="text"
                      value={section.headline}
                      onChange={(e) => handleHeroSectionChange(index, "headline", e.target.value)}
                      placeholder="e.g. Cheap Flights to London"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={section.subtitle}
                      onChange={(e) => handleHeroSectionChange(index, "subtitle", e.target.value)}
                      placeholder="e.g. Book now and save big on your next trip"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">CTA Text</label>
                      <input
                        type="text"
                        value={section.cta_text || ""}
                        onChange={(e) => handleHeroSectionChange(index, "cta_text", e.target.value)}
                        placeholder="e.g. Book Now"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">CTA Link (URL or #id)</label>
                      <input
                        type="text"
                        value={section.cta_url || ""}
                        onChange={(e) => handleHeroSectionChange(index, "cta_url", e.target.value)}
                        placeholder="e.g. /book or #pricing"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )})}
            
            {/* Backward Compatibility / Migration Display */}
            {(!formData.hero_sections || formData.hero_sections.length === 0) && (
               <div className="grid grid-cols-1 gap-6 pt-2">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">
                     Hero Headline (Legacy)
                   </label>
                   <input
                     type="text"
                     name="hero_headline"
                     value={formData.hero_headline || ""}
                     onChange={(e) => {
                       handleChange(e);
                       // Auto-migrate to first section if user starts typing here?
                       // Better to keep separate until fully migrated.
                       // Or we can auto-populate the first section.
                     }}
                     placeholder="e.g. Cheap Flights to London"
                     className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">
                     Hero Sub-title (Legacy)
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
                 <div className="col-span-1">
                    <button 
                       type="button" 
                       onClick={() => {
                         setFormData(prev => ({
                           ...prev,
                           hero_sections: transformHeroData(prev.hero_headline, prev.hero_subtitle)
                         }));
                       }}
                       className="text-xs text-blue-600 underline"
                     >
                       Convert to Multi-Slide Format
                     </button>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Route Information */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <div className="flex flex-col gap-4 mb-6">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Route Information</h3>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Average Flight Time
              </label>
              <input
                type="text"
                name="average_flight_time"
                value={formData.route_info?.average_flight_time || ""}
                onChange={(e) => handleRouteInfoChange("average_flight_time", e.target.value)}
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
                value={formData.route_info?.distance || ""}
                onChange={(e) => handleRouteInfoChange("distance", e.target.value)}
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
                      checked={(formData.route_info?.cheapest_month || "").split(",").map(m => m.trim()).filter(Boolean).includes(month)}
                      onChange={(e) => {
                        const currentMonths = (formData.route_info?.cheapest_month || "").split(",").map(m => m.trim()).filter(Boolean);
                        let newMonths;
                        if (e.target.checked) {
                          newMonths = [...currentMonths, month];
                        } else {
                          newMonths = currentMonths.filter(m => m !== month);
                        }
                        // Sort by month index to keep order consistent
                        newMonths.sort((a, b) => MONTHS.indexOf(a) - MONTHS.indexOf(b));
                        handleRouteInfoChange("cheapest_month", newMonths.join(","));
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
                value={formData.route_info?.daily_flights || ""}
                onChange={(e) => handleRouteInfoChange("daily_flights", e.target.value)}
                min="0"
                placeholder="e.g. 5"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Media & Description */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Media & Description</h3>
          <div className="space-y-8">
            <RichTextDescription 
              value={formData.rich_description || { content: "" }} 
              onChange={(newDesc) => setFormData(prev => ({ ...prev, rich_description: newDesc }))}
            />
          </div>
        </div>

        {/* Travel Guide Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Travel Guide</h3>
          <div className="pt-2 space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-600">travel_explore</span>
              <div>
                <h4 className="text-sm font-bold text-purple-900 mb-1">
                  {formData.travel_guide_heading || `Discover ${formData.arrival_airport || "Destination"}`}
                </h4>
                <p className="text-xs text-purple-700">
                  Create a rich travel guide for the destination city.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Guide Heading
                </label>
                <input
                  type="text"
                  name="travel_guide_heading"
                  value={formData.travel_guide_heading || ""}
                  onChange={handleChange}
                  placeholder={`e.g. Discover Kathmandu`}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cover Image
                </label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="travel_guide_image"
                      value={formData.travel_guide_image || ""}
                      onChange={handleChange}
                      placeholder="Select cover image..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none pr-24"
                    />
                    {formData.travel_guide_image && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded overflow-hidden border border-slate-200">
                        <img src={formData.travel_guide_image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openMediaModal("travel_guide_image")}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                  >
                    Select Image
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Guide Description
                </label>
                <textarea
                  name="travel_guide_description"
                  value={formData.travel_guide_description || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. Kathmandu, the capital of Nepal, is a vibrant city steeped in history and culture..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.travel_guide_tags || []).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...(formData.travel_guide_tags || [])];
                          newTags.splice(index, 1);
                          setFormData(prev => ({ ...prev, travel_guide_tags: newTags }));
                        }}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-600 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={formData.travel_guide_tags?.length ? "+ Add tag" : "Type tag and press Enter"}
                    className="inline-flex w-32 px-2 py-0.5 text-sm border-0 border-b-2 border-slate-200 focus:border-purple-500 focus:ring-0 bg-transparent outline-none placeholder-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !formData.travel_guide_tags?.includes(val)) {
                          setFormData(prev => ({
                            ...prev,
                            travel_guide_tags: [...(prev.travel_guide_tags || []), val]
                          }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">Press Enter to add tags (e.g. History, Nature, Culture)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Places of Interest (JSON/Text)
                  </label>
                  <textarea
                    name="travel_guide_places"
                    value={formData.travel_guide_places || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter places of interest description or data..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Getting Around (JSON/Text)
                  </label>
                  <textarea
                    name="travel_guide_getting_around"
                    value={formData.travel_guide_getting_around || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter transportation tips..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section (Rich Text) */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Content Section</h3>
          <div className="pt-2 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600">article</span>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-1">
                  {formData.content_sections?.title || `Cheap flights from ${formData.departure_airport || "Origin"} to ${formData.arrival_airport || "Destination"}`}
                </h4>
                <p className="text-xs text-indigo-700">
                  Add detailed content for SEO and user information.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  name="content_section_title"
                  value={formData.content_sections?.title || ""}
                  onChange={(e) => handleContentSectionChange("title", e.target.value)}
                  placeholder={`e.g. Cheap flights from Sydney to Kathmandu`}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Main Description
                </label>
                <textarea
                  name="content_section_description"
                  value={formData.content_sections?.description || ""}
                  onChange={(e) => handleContentSectionChange("description", e.target.value)}
                  rows={4}
                  placeholder="e.g. Booking your flights early is the best way to get cheap tickets..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Best time to visit (Content)
                  </label>
                  <textarea
                    name="content_section_best_time"
                    value={formData.content_sections?.best_time || ""}
                    onChange={(e) => handleContentSectionChange("best_time", e.target.value)}
                    rows={4}
                    placeholder="Enter details about the best time to visit..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Flight Duration & Stopovers (Content)
                  </label>
                  <textarea
                    name="content_section_duration_stopovers"
                    value={formData.content_sections?.duration_stopovers || ""}
                    onChange={(e) => handleContentSectionChange("duration_stopovers", e.target.value)}
                    rows={4}
                    placeholder="Enter details about flight duration and stopovers..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media & Description - Moved below Route Info */}{/* FAQs Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">FAQs</h3>
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
        </div>

        {/* Related Routes Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Related</h3>
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
        </div>

        {/* Things to Note Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Things to Note</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Origin Airport
              </label>
              <input
                type="text"
                name="things_to_note_origin_airport"
                value={formData.things_to_note_origin_airport || ""}
                onChange={handleChange}
                placeholder="e.g. London Heathrow"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time Difference
              </label>
              <input
                type="text"
                name="things_to_note_time_diff"
                value={formData.things_to_note_time_diff || ""}
                onChange={handleChange}
                placeholder="e.g. +5 hours"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Currency
              </label>
              <input
                type="text"
                name="things_to_note_currency"
                value={formData.things_to_note_currency || ""}
                onChange={handleChange}
                placeholder="e.g. GBP (£)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Power Plugs
              </label>
              <input
                type="text"
                name="things_to_note_power_plugs"
                value={formData.things_to_note_power_plugs || ""}
                onChange={handleChange}
                placeholder="e.g. Type G (230V, 50Hz)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>



        {/* SEO Section */}
        <div className="border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">SEO Settings</h3>
          <div className="grid grid-cols-1 gap-6 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SEO Title
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_settings?.title || ""}
                onChange={(e) => handleSeoChange("title", e.target.value)}
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
                value={formData.seo_settings?.description || ""}
                onChange={(e) => handleSeoChange("description", e.target.value)}
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
                  value={formData.seo_settings?.canonical_url || ""}
                  onChange={(e) => handleSeoChange("canonical_url", e.target.value)}
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
                value={formData.seo_settings?.schema_markup || ""}
                onChange={(e) => handleSeoChange("schema_markup", e.target.value)}
                rows={4}
                placeholder={`{"@context": "https://schema.org", ...}`}
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
                      checked={!!formData.seo_settings?.robots?.[item.key as keyof typeof formData.seo_settings.robots]}
                      onChange={() => handleSeoRobotsChange(item.key)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

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
        onSelect={handleMediaSelectWrapper}
      />
    </form>
  );
}
