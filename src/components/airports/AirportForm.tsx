"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateAirportDTO, Airport, FastFact, FAQ } from "@/types/airport";
import { airports } from "../../../libs/shared-utils/constants/airport";
import RichTextEditor from "@/components/RichTextEditor";
import { MediaSelectorModal } from "@/components/media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";
import AirlineAutocomplete from "@/components/AirlineAutocomplete";

interface AirportData {
  name: string;
  city: string;
  country: string;
  IATA: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
}

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
  const [mediaMode, setMediaMode] = useState<"featured" | "gallery">("featured");

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
  });

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
      });
    }
  }, [initialData]);

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

  const addTopAirline = (e: any) => {
    const value = e.target.value;
    if (value && !(formData.top_airlines || []).includes(value)) {
      setFormData(prev => ({
        ...prev,
        top_airlines: [...(prev.top_airlines || []), value]
      }));
      setAirlineInput("");
    }
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
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (val.length <= 3) {
                    const airport = (airports as unknown as AirportData[]).find((a) => a.IATA === val);
                    setFormData(prev => ({ 
                      ...prev, 
                      iata_code: val,
                      ...(airport ? {
                        name: airport.name,
                        city: airport.city,
                        country: airport.country,
                        latitude: parseFloat(airport.lat),
                        longitude: parseFloat(airport.lon),
                        timezone: airport.timezone
                      } : {})
                    }));
                  }
                }}
                placeholder="e.g. LHR"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono uppercase"
              />
            </div>

            {/* Airport Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-bold text-slate-700">
                Airport Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Heathrow Airport"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* City */}
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-bold text-slate-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={(e) => {
                  const val = e.target.value;
                  const airport = (airports as unknown as AirportData[]).find((a) => a.city.toLowerCase() === val.toLowerCase());
                  
                  setFormData(prev => ({
                    ...prev,
                    city: val,
                    ...(airport ? {
                       iata_code: airport.IATA,
                       name: airport.name,
                       country: airport.country,
                       latitude: parseFloat(airport.lat),
                       longitude: parseFloat(airport.lon),
                       timezone: airport.timezone
                    } : {})
                  }));
                }}
                placeholder="e.g. London"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-bold text-slate-700">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. United Kingdom"
                className="w-full h-12 px-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
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

        {/* Media & Description */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Media & Description</h3>
          
          {/* Featured Image */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Featured Image</label>
            <div className="flex gap-4 items-start">
              {formData.featured_image_url && (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={formData.featured_image_url} alt="Featured" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image_url: "" }))}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMediaMode("featured");
                  setIsMediaOpen(true);
                }}
                className="h-24 px-6 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <span className="text-xs font-medium">Select Image</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <RichTextEditor
              value={formData.description || ""}
              onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              placeholder="Enter airport description..."
            />
          </div>
        </div>

        {/* Fast Facts */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-800">Fast Facts</h3>
            <button
              type="button"
              onClick={addFastFact}
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add Fact
            </button>
          </div>
          <div className="space-y-3">
            {formData.fast_facts?.map((fact, index) => (
              <div key={index} className="flex gap-4 items-start">
                <input
                  type="text"
                  placeholder="Label (e.g. Terminals)"
                  value={fact.label}
                  onChange={(e) => handleFastFactChange(index, "label", e.target.value)}
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 5)"
                  value={fact.value}
                  onChange={(e) => handleFastFactChange(index, "value", e.target.value)}
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeFastFact(index)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
            {(!formData.fast_facts || formData.fast_facts.length === 0) && (
              <p className="text-sm text-slate-400 italic">No fast facts added yet.</p>
            )}
          </div>
        </div>

        {/* Top Airlines */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Top Airlines</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.top_airlines?.map((airline, index) => (
                <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                  {airline}
                  <button
                    type="button"
                    onClick={() => removeTopAirline(index)}
                    className="hover:text-blue-900 flex items-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            
            <AirlineAutocomplete
              label="Add Airline"
              name="airline_search"
              value={airlineInput}
              onChange={(e) => {
                setAirlineInput(e.target.value);
                // The Autocomplete calls onChange with the selected value when clicked
                // We'll catch that in the Autocomplete logic or we need to handle it here carefully
                // But wait, my addTopAirline expects an event-like object or value.
                // The Autocomplete's onChange passes an event-like object.
                if (e.target.value && e.target.value !== airlineInput) {
                     // If it's a selection (value changed significantly or via click)
                     // But the Autocomplete logic is a bit custom.
                     // Let's rely on the user clicking the option in Autocomplete.
                     addTopAirline(e);
                }
              }}
              icon="flight"
            />
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-800">Gallery</h3>
            <button
              type="button"
              onClick={() => {
                setMediaMode("gallery");
                setIsMediaOpen(true);
              }}
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add_photo_alternate</span> Add Images
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.gallery_urls?.map((url, index) => (
              <div key={index} className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
            {(!formData.gallery_urls || formData.gallery_urls.length === 0) && (
              <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No images in gallery.
              </div>
            )}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-800">FAQs</h3>
            <button
              type="button"
              onClick={addFaq}
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add FAQ
            </button>
          </div>
          <div className="space-y-4">
            {formData.faqs?.map((faq, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm"
                    placeholder="e.g. How many terminals?"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Answer</label>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                    className="w-full h-20 p-3 border border-slate-200 rounded-lg outline-none focus:border-primary text-sm resize-none"
                    placeholder="Enter answer..."
                  />
                </div>
              </div>
            ))}
            {(!formData.faqs || formData.faqs.length === 0) && (
              <p className="text-sm text-slate-400 italic">No FAQs added yet.</p>
            )}
          </div>
        </div>

        {/* Maps */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Maps</h3>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Map Embed Code</label>
            <textarea
              name="map_embed_code"
              value={formData.map_embed_code || ""}
              onChange={handleChange}
              placeholder="<iframe src='...' ...></iframe>"
              className="w-full h-32 p-4 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono text-sm"
            />
            <p className="text-xs text-slate-500">Paste the Google Maps embed HTML code here.</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isEditing ? "Update Airport" : "Create Airport"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}
      </form>

      <MediaSelectorModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
        allowMultiple={mediaMode === "gallery"}
      />
    </>
  );
}
