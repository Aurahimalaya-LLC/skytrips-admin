"use client";

import { useRef } from "react";

interface FareBrand {
  id: string;
  name: string;
  price: number;
  currency: string;
  recommended?: boolean;
  features: {
    included: boolean;
    text: string;
  }[];
}

interface FareBrandsCarouselProps {
  basePrice: number;
  currency: string;
  onSelect: (brandId: string) => void;
}

export default function FareBrandsCarousel({ basePrice, currency, onSelect }: FareBrandsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock data generation based on base price
  const brands: FareBrand[] = [
    {
      id: "light",
      name: "ECONOMY LIGHT",
      price: basePrice,
      currency: currency,
      features: [
        { included: false, text: "No Checked Bag" },
        { included: true, text: "7kg Cabin Bag" },
        { included: false, text: "Non-refundable" },
      ]
    },
    {
      id: "standard",
      name: "ECONOMY STANDARD",
      price: Math.round(basePrice * 1.18),
      currency: currency,
      recommended: true,
      features: [
        { included: true, text: "23kg Checked Bag" },
        { included: true, text: "7kg Cabin Bag" },
        { included: true, text: "Refund Fee Applies" },
      ]
    },
    {
      id: "flex",
      name: "ECONOMY FLEX",
      price: Math.round(basePrice * 1.42),
      currency: currency,
      features: [
        { included: true, text: "2 x 23kg Bags" },
        { included: true, text: "Free Cancellation" },
        { included: true, text: "Priority Boarding" },
      ]
    },
    {
      id: "business",
      name: "BUSINESS SAVER",
      price: Math.round(basePrice * 2.5),
      currency: currency,
      features: [
        { included: true, text: "2 x 32kg Bags" },
        { included: true, text: "Lounge Access" },
        { included: true, text: "Priority Boarding" },
      ]
    }
  ];

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
                  ? "border-primary shadow-lg shadow-blue-500/10 scale-[1.02] z-10" 
                  : "border-slate-100 hover:border-slate-300 hover:shadow-md"
              }`}
              onClick={() => onSelect(brand.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(brand.id)}
            >
              {brand.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Recommended
                </div>
              )}

              <div className="mb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{brand.name}</h5>
                <p className="text-2xl font-black text-slate-900">
                  ${brand.price}<span className="text-sm font-bold text-slate-400">.00</span>
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
