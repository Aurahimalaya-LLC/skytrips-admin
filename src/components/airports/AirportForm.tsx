"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateAirportDTO, Airport, FastFact, FAQ } from "@/types/airport";
import RichTextEditor from "@/components/RichTextEditor";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import AirlineAutocomplete from "@/components/AirlineAutocomplete";
import CityAutocomplete from "./CityAutocomplete";
import CountryAutocomplete from "./CountryAutocomplete";
import AirportNameAutocomplete from "./AirportNameAutocomplete";
import { supabase } from "@/lib/supabase";

interface AirportFormProps {
  initialData?: Airport;
  isEditing?: boolean;
}

export default function AirportForm({ initialData, isEditing = false }: AirportFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Media Modal State
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<"featured" | "gallery" | "seo">("featured");

  // Airline Autocomplete State
  const [airlineInput, setAirlineInput] = useState("");

  const [formData, setFormData] = useState<CreateAirportDTO>({
    iata_code: "",
    name: "",
    city: "",
    country: "",
    latitude: undefined,
    longitude: undefined,
    timezone: "",
    active: true,
    featured_image_url: "",
    description: "",
    fast_facts: [],
    top_airlines: [],
    gallery_urls: [],
    faqs: [],
    map_embed_code: "",
    seo_title: "",
    meta_description: "",
    seo_image_url: "",
    slug: "",
    canonical_url: "",
    schema_markup: "",
    no_index: false,
    no_follow: false,
    no_archive: false,
    no_image_index: false,
    no_snippet: false,
  });

  const [domain, setDomain] = useState("localhost:3000");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setDomain(window.location.host);
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        iata_code: initialData.iata_code,
        name: initialData.name,
        city: initialData.city,
        country: initialData.country,
        latitude: initialData.latitude || undefined,
        longitude: initialData.longitude || undefined,
        timezone: initialData.timezone || "",
        active: initialData.active,
        featured_image_url: initialData.featured_image_url || "",
        description: initialData.description || "",
        fast_facts: initialData.fast_facts || [],
        top_airlines: initialData.top_airlines || [],
        gallery_urls: initialData.gallery_urls || [],
        faqs: initialData.faqs || [],
        map_embed_code: initialData.map_embed_code || "",
        seo_title: initialData.seo_title || "",
        meta_description: initialData.meta_description || "",
        seo_image_url: initialData.seo_image_url || "",
        slug: initialData.slug || "",
        canonical_url: initialData.canonical_url || "",
        schema_markup: initialData.schema_markup || "",
        no_index: initialData.no_index || false,
        no_follow: initialData.no_follow || false,
        no_archive: initialData.no_archive || false,
        no_image_index: initialData.no_image_index || false,
        no_snippet: initialData.no_snippet || false,
      });
    }
  }, [initialData]);

  // Lookup airport by IATA code
  useEffect(() => {
    const fetchByIata = async () => {
      const code = formData.iata_code.toUpperCase();
      if (code.length === 3 && !isEditing) {
        // Only auto-fill on Create or if explicitly typed, but avoid overwriting on Edit if not desired
        // Actually, logic was: if 3 chars, fetch.
        try {
           const { data, error } = await supabase
            .from("airports")
            .select("*")
            .eq("iata_code", code)
            .single();
           
           if (data && !error) {
             setFormData(prev => ({
               ...prev,
               name: prev.name || data.name, // Only fill if empty? Or overwrite? Previous logic overwrote.
               city: prev.city || data.city || "",
               country: prev.country || data.country || "",
               latitude: prev.latitude ?? data.latitude,
               longitude: prev.longitude ?? data.longitude,
               timezone: prev.timezone || data.timezone || ""
             }));
           }
        } catch (err) {
          console.error("Error fetching airport by IATA:", err);
        }
      }
    };
    
    // Debounce slightly or just run?
    // Since it's exactly 3 chars, we can just run it.
    // However, we need to distinguish user typing vs initial load.
    // Initial load sets data, so useEffect won't trigger if we check for changes differently?
    // Actually, this useEffect depends on formData.iata_code.
    // If initialData sets it, this runs. But we have `!isEditing` check to maybe prevent overwriting existing edit data?
    // But if user changes IATA on edit page?
    // Let's stick to user interaction: onChange handler is better for this than useEffect.
  }, []); 

  const handleIataChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    
    // Update state first
    setFormData(prev => ({ ...prev, iata_code: val }));

    if (val.length === 3) {
      try {
        const { data, error } = await supabase
          .from("airports")
          .select("*")
          .eq("iata_code", val)
          .single();
        
        if (data && !error) {
           setFormData(prev => ({
             ...prev,
             name: data.name,
             city: data.city || "",
             country: data.country || "",
             latitude: data.latitude || undefined,
             longitude: data.longitude || undefined,
             timezone: data.timezone || ""
           }));
        }
      } catch (err) {
        console.error("Error fetching airport by IATA:", err);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || undefined : value,
    }));
  };

  const handleMediaSelect = (files: MediaFile | MediaFile[]) => {
    if (mediaMode === "featured") {
      const file = Array.isArray(files) ? files[0] : files;
      if (file?.url) {
        setFormData(prev => ({ ...prev, featured_image_url: file.url }));
      }
    } else if (mediaMode === "seo") {
      const file = Array.isArray(files) ? files[0] : files;
      if (file?.url) {
        setFormData(prev => ({ ...prev, seo_image_url: file.url }));
      }
    } else {
      // Gallery - append new files
      const newFiles = Array.isArray(files) ? files : [files];
      const urls = newFiles.map(f => f.url).filter((u): u is string => !!u);
      setFormData(prev => ({
        ...prev,
        gallery_urls: [...(prev.gallery_urls || []), ...urls]
      }));
    }
    setIsMediaOpen(false);
  };

  const handleFastFactChange = (index: number, field: keyof FastFact, value: string) => {
    const newFacts = [...(formData.fast_facts || [])];
    newFacts[index] = { ...newFacts[index], [field]: value };
    setFormData(prev => ({ ...prev, fast_facts: newFacts }));
  };

  const addFastFact = () => {
    setFormData(prev => ({
      ...prev,
      fast_facts: [...(prev.fast_facts || []), { label: "", value: "" }]
    }));
  };

  const removeFastFact = (index: number) => {
    const newFacts = [...(formData.fast_facts || [])];
    newFacts.splice(index, 1);
    setFormData(prev => ({ ...prev, fast_facts: newFacts }));
  };

  const removeTopAirline = (index: number) => {
    const newAirlines = [...(formData.top_airlines || [])];
    newAirlines.splice(index, 1);
    setFormData(prev => ({ ...prev, top_airlines: newAirlines }));
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...(formData.gallery_urls || [])];
    newGallery.splice(index, 1);
    setFormData(prev => ({ ...prev, gallery_urls: newGallery }));
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const addFaq = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: "", answer: "" }]
    }));
  };

  const removeFaq = (index: number) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs.splice(index, 1);
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (formData.iata_code.length !== 3) {
      setError("IATA code must be exactly 3 characters.");
      setLoading(false);
      return;
    }

    try {
      const url = isEditing && initialData ? `/api/airports/${initialData.id}` : "/api/airports";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      router.push("/dashboard/airports");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
        
        {/* Basic Info Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IATA Code */}
            <div className="space-y-2">
              <label htmlFor="iata_code" className="text-sm font-bold text-slate-700">
                IATA Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="iata_code"
                name="iata_code"
                required
                maxLength={3}
                value={formData.iata_code}
                onChange={handleIataChange}
                placeholder="e.g. LHR"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono uppercase"
              />
            </div>

            {/* Airport Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">
                Airport Name <span className="text-red-500">*</span>
              </label>
              <AirportNameAutocomplete
                value={formData.name}
                onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                onSelect={(airport) => {
                  setFormData(prev => ({
                    ...prev,
                    name: airport.name,
                    iata_code: airport.iata_code,
                    city: airport.city,
                    country: airport.country,
                    latitude: airport.latitude || undefined,
                    longitude: airport.longitude || undefined,
                    timezone: airport.timezone || ""
                  }));
                }}
                placeholder="e.g. Heathrow Airport"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-bold text-slate-700">
                City <span className="text-red-500">*</span>
              </label>
              <CityAutocomplete
                value={formData.city}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, city: val }));
                  // Optional: lookup by city if needed, but city names are not unique enough for full fill
                }}
                placeholder="e.g. London"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-bold text-slate-700">
                Country <span className="text-red-500">*</span>
              </label>
              <CountryAutocomplete
                value={formData.country}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, country: val }));
                }}
                placeholder="e.g. United Kingdom"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
            </div>

            {/* Coordinates & Timezone */}
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-bold text-slate-700">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                step="any"
                value={formData.latitude || ""}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-bold text-slate-700">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                step="any"
                value={formData.longitude || ""}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone" className="text-sm font-bold text-slate-700">Timezone</label>
              <input
                type="text"
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                placeholder="e.g. Europe/London"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3 pt-8">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-700">
                Active (Published)
              </label>
            </div>
          </div>
        </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Description</label>
        <RichTextEditor
          value={formData.description || ""}
          onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
        />
      </div>

      {/* Featured Image */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Featured Image</label>
          <button
            type="button"
            onClick={() => {
              setMediaMode("featured");
              setIsMediaOpen(true);
            }}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Select Image
          </button>
        </div>
        
        {formData.featured_image_url ? (
          <div className="relative aspect-video w-full md:w-1/2 rounded-lg overflow-hidden border border-slate-200 group">
            <img 
              src={formData.featured_image_url} 
              alt="Featured" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, featured_image_url: "" }))}
                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => {
              setMediaMode("featured");
              setIsMediaOpen(true);
            }}
            className="aspect-video w-full md:w-1/2 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-slate-50"
          >
            <span className="material-symbols-outlined text-[48px]">add_photo_alternate</span>
            <span className="text-sm font-medium mt-2">Add Featured Image</span>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Gallery</label>
          <button
            type="button"
            onClick={() => {
              setMediaMode("gallery");
              setIsMediaOpen(true);
            }}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Add Images
          </button>
        </div>
        
        {formData.gallery_urls && formData.gallery_urls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.gallery_urls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                <img 
                  src={url} 
                  alt={`Gallery ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
            <div 
              onClick={() => {
                setMediaMode("gallery");
                setIsMediaOpen(true);
              }}
              className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary cursor-pointer transition-colors bg-slate-50"
            >
              <span className="material-symbols-outlined text-[32px]">add</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">No images in gallery</div>
        )}
      </div>

      {/* Fast Facts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">Fast Facts</label>
          <button
            type="button"
            onClick={addFastFact}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Fact
          </button>
        </div>
        
        <div className="space-y-3">
          {(formData.fast_facts || []).map((fact, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <input
                type="text"
                value={fact.label}
                onChange={(e) => handleFastFactChange(idx, "label", e.target.value)}
                placeholder="Label (e.g. Terminals)"
                className="flex-1 h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
              <input
                type="text"
                value={fact.value}
                onChange={(e) => handleFastFactChange(idx, "value", e.target.value)}
                placeholder="Value (e.g. 5)"
                className="flex-1 h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => removeFastFact(idx)}
                className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
          {(!formData.fast_facts || formData.fast_facts.length === 0) && (
            <div className="text-sm text-slate-500 italic">No fast facts added</div>
          )}
        </div>
      </div>

      {/* Top Airlines */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700">Top Airlines</label>
        <AirlineAutocomplete
          value={airlineInput}
          onChange={(val) => setAirlineInput(typeof val === 'string' ? val : val.target.value)}
          onSelect={(airline) => {
            if (!(formData.top_airlines || []).includes(airline.name)) {
              setFormData(prev => ({
                ...prev,
                top_airlines: [...(prev.top_airlines || []), airline.name]
              }));
              setAirlineInput("");
            }
          }}
          placeholder="Search and add airlines..."
          icon="airlines"
          className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
        />

        <div className="flex flex-wrap gap-2">
          {(formData.top_airlines || []).map((airline, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700">
              <span>{airline}</span>
              <button
                type="button"
                onClick={() => removeTopAirline(idx)}
                className="hover:text-red-500 flex items-center"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-700">FAQs</label>
          <button
            type="button"
            onClick={addFaq}
            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add FAQ
          </button>
        </div>
        
        <div className="space-y-4">
          {(formData.faqs || []).map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
              <div className="flex justify-between items-start gap-4">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                  placeholder="Question"
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeFaq(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              <textarea
                value={faq.answer}
                onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                placeholder="Answer"
                rows={2}
                className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-sm resize-y"
              />
            </div>
          ))}
          {(!formData.faqs || formData.faqs.length === 0) && (
            <div className="text-sm text-slate-500 italic">No FAQs added</div>
          )}
        </div>
      </div>

      {/* Map Embed */}
      <div className="space-y-2">
        <label htmlFor="map_embed_code" className="text-sm font-bold text-slate-700">Map Embed Code</label>
        <textarea
          id="map_embed_code"
          name="map_embed_code"
          rows={3}
          value={formData.map_embed_code}
          onChange={handleChange}
          placeholder="<iframe src=... ></iframe>"
          className="w-full p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono text-sm"
        />
      </div>

      {/* SEO Settings */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">SEO Settings</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                SEO Title
              </label>
              <span className="text-xs text-muted-foreground">
                {(formData.seo_title || "").length} / 60
              </span>
            </div>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title || ""}
              onChange={handleChange}
              maxLength={60}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              placeholder="e.g. Madrid Airport (MAD) Flights"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Meta Description
              </label>
              <span className="text-xs text-muted-foreground">
                {(formData.meta_description || "").length} / 160
              </span>
            </div>
            <textarea
              name="meta_description"
              rows={3}
              value={formData.meta_description || ""}
              onChange={handleChange}
              maxLength={160}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
              placeholder="Brief description for search results..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              SEO Image
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                name="seo_image_url"
                value={formData.seo_image_url || ""}
                onChange={handleChange}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                placeholder="https://example.com/seo-image.png"
              />
              <button
                type="button"
                onClick={() => {
                  setMediaMode("seo");
                  setIsMediaOpen(true);
                }}
                className="px-3 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                Library
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              URL Slug
            </label>
            <div className="flex">
              <div className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-3 py-2.5 text-slate-600 text-sm flex items-center">
                {domain}/airport/
              </div>
              <input
                type="text"
                name="slug"
                value={formData.slug || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, slug: val }));
                }}
                className="flex-1 bg-white border border-slate-200 rounded-r-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="madrid-barajas"
              />
            </div>
            {formData.slug && (
              <p className="mt-2 text-xs text-primary">
                Preview: https://{domain}/airport/{formData.slug}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Canonical URL
            </label>
            <input
              type="text"
              name="canonical_url"
              value={formData.canonical_url || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              placeholder="https://example.com/canonical-page"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Specify the preferred URL for this page to avoid duplicate content issues
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Schema Markup (JSON-LD)
            </label>
            <textarea
              name="schema_markup"
              rows={4}
              value={formData.schema_markup || ""}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono text-xs"
              placeholder='{"@context": "https://schema.org", "@type": "Airport", ...}'
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no_index"
                name="no_index"
                checked={formData.no_index}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="no_index" className="text-sm text-slate-700">noindex</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no_follow"
                name="no_follow"
                checked={formData.no_follow}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="no_follow" className="text-sm text-slate-700">nofollow</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no_archive"
                name="no_archive"
                checked={formData.no_archive}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="no_archive" className="text-sm text-slate-700">noarchive</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no_image_index"
                name="no_image_index"
                checked={formData.no_image_index}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="no_image_index" className="text-sm text-slate-700">noimageindex</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="no_snippet"
                name="no_snippet"
                checked={formData.no_snippet}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="no_snippet" className="text-sm text-slate-700">nosnippet</label>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            "Save Airport"
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          {error}
        </div>
      )}
    </form>

    <MediaSelectorModal
      isOpen={isMediaOpen}
      onClose={() => setIsMediaOpen(false)}
      onSelect={handleMediaSelect}
      multiple={mediaMode === "gallery"}
    />
  </>
  );
}
