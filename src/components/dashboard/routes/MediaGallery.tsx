"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaSelectorModal } from "../../media/MediaSelectorModal";
import { MediaFile } from "@/lib/media-service";

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  thumbnail?: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
}

export default function MediaGallery({ media, onChange }: MediaGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMedia = (files: MediaFile | MediaFile[]) => {
    const newItems: MediaItem[] = (Array.isArray(files) ? files : [files]).map(file => ({
      id: crypto.randomUUID(),
      url: file.url || file.file_path, // Fallback if url is missing
      type: file.mime_type.startsWith('video') ? 'video' : 'image',
      alt: file.alt_text || file.title,
    }));
    onChange([...media, ...newItems]);
  };

  const handleRemove = (index: number) => {
    const newMedia = [...media];
    newMedia.splice(index, 1);
    onChange(newMedia);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-700">Media Gallery</h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 font-medium transition-colors"
        >
          + Add Media
        </button>
      </div>

      {media.length === 0 ? (
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">add_photo_alternate</span>
          <p className="text-sm text-slate-500">Drag & drop images or click to browse</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <Image
                  src={item.url}
                  alt={item.alt || "Gallery image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-white/90 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                  title="Remove"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddMedia}
        multiple={true}
      />
    </div>
  );
}
