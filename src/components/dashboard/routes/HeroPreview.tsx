"use client";

import { useEffect, useState } from "react";

interface HeroPreviewProps {
  headline: string;
  subtitle: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
}

export default function HeroPreview({ 
  headline, 
  subtitle, 
  ctaText = "Book Now", 
  ctaUrl = "#", 
  backgroundImage 
}: HeroPreviewProps) {
  // Mock smooth scrolling for preview purposes
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (ctaUrl.startsWith("#")) {
      e.preventDefault();
      console.log(`[HeroPreview] Smooth scrolling to ${ctaUrl}`);
      // In a real scenario: document.querySelector(ctaUrl)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full h-[300px] rounded-xl overflow-hidden shadow-lg group">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-slate-900 transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center p-8 z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
          {headline || "Your Headline Here"}
        </h2>
        
        <p className="text-lg text-slate-200 mb-8 max-w-2xl font-medium drop-shadow-sm">
          {subtitle || "Your compelling subtitle goes here to attract users."}
        </p>

        {ctaText && (
          <a
            href={ctaUrl}
            onClick={handleCtaClick}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label={`${ctaText} - ${headline}`}
          >
            {ctaText}
            <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </a>
        )}
      </div>

      {/* Badge/Tag (Optional visual element) */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Preview
      </div>
    </div>
  );
}
