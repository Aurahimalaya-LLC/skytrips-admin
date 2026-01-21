 "use client";

import { useRef } from "react";
import type { FareBrand } from "@/types/flight-search";

interface FareBrandsCarouselProps {
  brands: FareBrand[];
  onSelect: (brandId: string) => void;
}

export default function FareBrandsCarousel({ brands, onSelect }: FareBrandsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="mt-6 border-t border-slate-100 pt-6 animate-in slide-in-from-top-4 fade-in duration-300">
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Available Fare Brands</h4>
      
      <div className="relative group/carousel">
        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0"
          aria-label="Scroll left"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        <button 
          onClick={() => scroll("right")}
          className="absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className={`min-w-[240px] md:min-w-[260px] p-5 rounded-xl border-2 cursor-pointer transition-all snap-center relative bg-white flex flex-col ${
                brand.recommended 
                  ? "border-primary/70 shadow-md shadow-blue-500/10"
                  : "border-slate-100 hover:border-slate-300 hover:shadow-md"
              }`}
              onClick={() => onSelect(brand.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(brand.id)}
            >
              <div className="mb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{brand.name}</h5>
                <p className="text-2xl font-black text-slate-900">
                  {brand.currency} {brand.price.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {brand.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                       feature.text.includes("Fee") ? (
                         <span className="material-symbols-outlined text-[16px] text-orange-500 shrink-0">info</span>
                       ) : (
                         <span className="material-symbols-outlined text-[16px] text-green-500 shrink-0">check</span>
                       )
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-red-400 shrink-0">close</span>
                    )}
                    <span className="text-sm font-medium text-slate-600 leading-tight">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => onSelect(brand.id)}
                className={`w-full py-2 rounded-lg font-bold text-sm transition-colors mt-auto ${
                  brand.recommended
                  ? "bg-blue-50 text-primary hover:bg-blue-100"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
                Select Fare
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
