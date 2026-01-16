"use client";

import { useState } from "react";
import Image from "next/image";
import { MediaFile } from "@/lib/media-service";

interface MediaThumbnailProps {
  file: MediaFile;
  onClick?: () => void;
  className?: string;
  objectFit?: "cover" | "contain";
}

export function MediaThumbnail({ file, onClick, className = "", objectFit = "cover" }: MediaThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const isImage = file.mime_type?.startsWith("image");
  const isVideo = file.mime_type?.startsWith("video");
  const isAudio = file.mime_type?.startsWith("audio");
  const isPdf = file.mime_type === "application/pdf";

  const renderIcon = () => {
    if (isVideo) return "movie";
    if (isAudio) return "music_note";
    if (isPdf) return "picture_as_pdf";
    return "description";
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (isImage && !hasError) {
    // Clean up URL: Remove whitespace and ensure it's a valid string
    let imageUrl = (file.url || "").trim();
    
    // Check if URL is valid before rendering
    if (!imageUrl) {
      return (
        <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
           <span className="text-xs text-slate-400">No URL</span>
        </div>
      );
    }

    return (
      <div 
        className={`relative w-full h-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${className}`}
        onClick={onClick}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-100 dark:bg-slate-800">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
        {/* Fallback img tag if Next.js Image fails for some reason, though unoptimized should handle it */}
        <img
          src={imageUrl}
          alt={file.alt_text || file.title}
          className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center w-full h-full bg-slate-100 dark:bg-slate-800 text-slate-400 ${className}`}
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-4xl mb-1">
        {hasError ? "broken_image" : renderIcon()}
      </span>
      {hasError && <span className="text-[10px] text-red-400">Failed to load</span>}
      {!hasError && <span className="text-[10px] uppercase">{file.mime_type?.split("/")[1] || "FILE"}</span>}
    </div>
  );
}
