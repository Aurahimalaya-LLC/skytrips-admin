"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaSelectorModal } from "../../media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";

interface RichDescription {
  content: string;
  sections?: {
    heading: string;
    content: string;
    image?: string;
    expanded?: boolean;
  }[];
}

interface RichTextDescriptionProps {
  value: RichDescription;
  onChange: (value: RichDescription) => void;
}

export default function RichTextDescription({ value, onChange }: RichTextDescriptionProps) {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMainContentChange = (content: string) => {
    onChange({ ...value, content });
  };

  const handleAddSection = () => {
    const newSections = [
      ...(value.sections || []),
      { heading: "", content: "", expanded: true }
    ];
    onChange({ ...value, sections: newSections });
  };

  const handleSectionChange = (index: number, field: "heading" | "content" | "image", newVal: string) => {
    const newSections = [...(value.sections || [])];
    newSections[index] = { ...newSections[index], [field]: newVal };
    onChange({ ...value, sections: newSections });
  };

  const handleToggleSection = (index: number) => {
    const newSections = [...(value.sections || [])];
    newSections[index] = { ...newSections[index], expanded: !newSections[index].expanded };
    onChange({ ...value, sections: newSections });
  };

  const handleRemoveSection = (index: number) => {
    const newSections = [...(value.sections || [])];
    newSections.splice(index, 1);
    onChange({ ...value, sections: newSections });
  };

  const openImageModal = (index: number) => {
    setActiveSectionIndex(index);
    setIsModalOpen(true);
  };

  const handleImageSelect = (file: MediaFile | MediaFile[]) => {
    if (activeSectionIndex === null) return;
    
    // Handle single selection
    const selectedFile = Array.isArray(file) ? file[0] : file;
    const url = selectedFile.url || selectedFile.file_path;
    
    handleSectionChange(activeSectionIndex, "image", url);
    setIsModalOpen(false);
    setActiveSectionIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <label className="block text-sm font-medium text-slate-700">Expandable Content Sections</label>
          <button
            type="button"
            onClick={handleAddSection}
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 font-medium transition-colors"
          >
            + Add Section
          </button>
        </div>

        {(!value.sections || value.sections.length === 0) && (
          <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
            No additional sections added.
          </p>
        )}

        <div className="space-y-3">
          {value.sections?.map((section, index) => (
            <div key={index} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
              <div 
                data-testid={`section-header-${index}`}
                className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                onClick={() => handleToggleSection(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleSection(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={section.expanded}
              >
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${section.expanded ? 'rotate-90' : ''}`}>
                  chevron_right
                </span>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSectionChange(index, "heading", e.target.value);
                  }}
                  placeholder="Section Heading (e.g., 'What to Pack')"
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 placeholder-slate-400"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSection(index);
                  }}
                  className="text-slate-400 hover:text-red-500 p-1"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              
              {section.expanded && (
                <div className="p-4 space-y-4">
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                    placeholder="Enter section content..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm resize-y bg-slate-50/50"
                  />
                  
                  {/* Image Section */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">Section Image (Optional)</label>
                    
                    {section.image ? (
                      <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                        <Image 
                          src={section.image} 
                          alt={section.heading || "Section image"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openImageModal(index)}
                            className="px-3 py-1.5 bg-white/90 text-slate-700 rounded-lg text-xs font-medium hover:bg-white"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSectionChange(index, "image", "")}
                            className="px-3 py-1.5 bg-red-50/90 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openImageModal(index)}
                        className="w-full h-24 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Add image to section"
                      >
                        <span className="material-symbols-outlined mb-1">add_photo_alternate</span>
                        <span className="text-xs">Add Image</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveSectionIndex(null);
        }}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
