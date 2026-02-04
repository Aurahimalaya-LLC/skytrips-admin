
"use client";

import React from "react";
import { ParsedPNR } from "@/lib/services/pnr-parser";
import { format, parseISO, differenceInMinutes } from "date-fns";

interface TicketPreviewProps {
  data: ParsedPNR;
  price?: string | number; // Added price prop
  className?: string;
}

// Helper to format price
const formatPrice = (price: string | number) => {
    if (!price) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price; // Return as is if not a valid number
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Default to USD, ideally should be dynamic
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numPrice);
};

// Helper to calculate duration between two dates
const getDuration = (start: string, end: string) => {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    const diff = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}H ${minutes}M`;
  } catch (e) {
    return "";
  }
};

// Helper to format date like "FEB 11:45"
// Since input might be ISO or raw, we try to parse ISO first
const formatDate = (dateStr: string) => {
  try {
    const date = parseISO(dateStr);
    return {
      month: format(date, "MMM").toUpperCase(),
      day: format(date, "dd"),
      time: format(date, "HH:mm"),
      full: format(date, "dd MMM HH:mm"),
    };
  } catch (e) {
    return { month: "", day: "", time: dateStr, full: dateStr };
  }
};

export default function TicketPreview({ data, price, className = "" }: TicketPreviewProps) {
  // Simple heuristic to split Outbound/Return
  // If segments > 1 and the last segment's arrival city is the first segment's departure city,
  // we might assume it's a return trip.
  // For now, we'll split roughly in half if it looks like a round trip, or just show all as one sequence.
  
  // Better logic: Find the "break" where the next departure is from the *original* origin,
  // or significantly later?
  // Let's assume for this specific design request, we split into two columns if possible.
  
  const segments = data.segments;
  let outboundSegments = segments;
  let returnSegments: typeof segments = [];

  // Check for Return Trip
  // If we have multiple segments, and at some point we fly back towards the origin?
  // Let's just split by "significant layover" > 24h? Or just if destination == origin?
  
  const origin = segments[0]?.departure_airport;
  const returnIndex = segments.findIndex((seg, idx) => idx > 0 && seg.departure_airport === origin); // Very naive
  
  // More robust: If we have 2 segments A->B, B->A.
  if (segments.length >= 2) {
      // Find the segment that flies BACK to the first segment's departure city (or close to it)
      // Or simply split in half for visual balance if user didn't specify.
      // Let's use the returnIndex logic.
      if (returnIndex !== -1) {
          outboundSegments = segments.slice(0, returnIndex);
          returnSegments = segments.slice(returnIndex);
      } else if (segments.length > 2) {
           // Maybe split in half?
           // For now, keep all in outbound if no clear return pattern.
      }
  }

  const renderSegment = (seg: typeof segments[0], isLast: boolean, nextSeg?: typeof segments[0]) => {
    const dep = formatDate(seg.departure_time);
    const arr = formatDate(seg.arrival_time);
    
    // Calculate transit/layover if there is a next segment
    let layoverDuration = "";
    if (nextSeg) {
        layoverDuration = getDuration(seg.arrival_time, nextSeg.departure_time);
    }

    return (
      <div key={seg.flight_number} className="relative pl-8 pb-8 last:pb-0">
        {/* Timeline Line */}
        {!isLast && (
          <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-300"></div>
        )}
        
        {/* Departure Node */}
        <div className="flex items-start mb-8 relative">
             {/* Date Box */}
            <div className="absolute -left-8 top-0 bg-[#8bc34a] text-white text-[10px] font-bold p-1 rounded-sm w-10 text-center leading-tight z-10">
                <div className="text-xs">{dep.month}</div>
                <div>{dep.day} {dep.time}</div>
            </div>
            
            {/* Dot */}
             {/* We need a specific arrow layout like the image */}
             {/* Actually the image has Date Box on left, Text on right. And a line connecting them. */}
        </div>

        {/* Let's redo the structure to match the visual exactness of the image */}
        {/* The image shows: 
            [DateBox]   Origin (Code)      Dest (Time)     [Plane Icon]
               |
               | (Line)
               |
            [Transit Info]
               |
            [DateBox]   Origin (Code)      Dest (Time)     [Plane Icon]
        */}
      </div>
    );
  };

  return (
    <div className={`bg-white p-0 rounded-xl overflow-hidden shadow-lg font-sans max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-100 flex items-center gap-4">
        {/* Logo Placeholder */}
        <div className="w-12 h-12 relative shrink-0">
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Thai_Airways_Logo.svg/1200px-Thai_Airways_Logo.svg.png" alt="Airline Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a237e] uppercase tracking-wide">
          {data.segments[0]?.airline_code === "TG" ? "THAI AIRWAYS" : `${data.segments[0]?.airline_code} AIRLINES`} ITINERARY
        </h1>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Outbound Column */}
        <div className="flex-1 p-6 border-r border-gray-100 last:border-0">
          <div className="bg-[#8bc34a] text-white font-bold text-center py-2 mb-8 uppercase tracking-wider text-sm rounded-sm shadow-sm">
            Outbound
          </div>
          <Timeline segments={outboundSegments} color="green" />
        </div>

        {/* Return Column (Only if exists) */}
        {returnSegments.length > 0 && (
          <div className="flex-1 p-6">
            <div className="bg-[#f57c00] text-white font-bold text-center py-2 mb-8 uppercase tracking-wider text-sm rounded-sm shadow-sm">
              Return
            </div>
             <Timeline segments={returnSegments} color="orange" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#1a237e] text-white p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-bold text-lg tracking-wide uppercase">
        <span>Confirmed ({data.pnr_number}) For {data.passengers.length} Passenger{data.passengers.length > 1 ? 's' : ''}</span>
        
        {price && (
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1 rounded-lg">
                <span className="text-sm opacity-80 font-normal">Total Price:</span>
                <span className="text-xl text-[#8bc34a]">{formatPrice(price)}</span>
            </div>
        )}
      </div>
    </div>
  );
}

function Timeline({ segments, color }: { segments: ParsedPNR['segments'], color: 'green' | 'orange' }) {
    const themeColor = color === 'green' ? '#8bc34a' : '#f57c00'; // Green or Orange
    
    // We need to render the "Flights" and the "Transits" between them.
    // The image shows: Flight 1 -> Transit -> Flight 2.
    
    return (
        <div className="relative">
            {segments.map((seg, idx) => {
                const isLast = idx === segments.length - 1;
                const nextSeg = segments[idx + 1];
                
                const dep = formatDate(seg.departure_time);
                const arr = formatDate(seg.arrival_time); // Arrival time at destination

                // Calculate layover if not last
                let layover = null;
                if (nextSeg) {
                    const dur = getDuration(seg.arrival_time, nextSeg.departure_time);
                    layover = {
                        duration: dur,
                        location: seg.arrival_airport
                    };
                }

                return (
                    <div key={idx} className="relative pb-0">
                         {/* Flight Segment Row */}
                         <div className="flex items-start justify-between mb-8 relative z-10">
                            {/* Date Box */}
                            <div className={`w-14 shrink-0 flex flex-col items-center justify-center py-1 px-1 rounded text-white text-xs font-bold leading-tight shadow-sm`} style={{ backgroundColor: themeColor }}>
                                <span className="uppercase">{dep.month}</span>
                                <span className="text-sm">{dep.day}</span>
                                <span className="font-normal opacity-90">{dep.time}</span>
                            </div>

                            {/* Arrow Line Graphic */}
                            <div className="flex-1 mx-4 flex flex-col items-center relative top-2">
                                {/* The green/orange arrow line */}
                                <div className="w-full h-0.5 bg-current opacity-30 relative" style={{ color: themeColor }}>
                                    <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 rotate-45" style={{ borderColor: themeColor }}></div>
                                    <div className="absolute -left-1 -top-1 w-2 h-2 border-b-2 border-l-2 rotate-45" style={{ borderColor: themeColor }}></div>
                                </div>
                            </div>

                             {/* Plane Icon */}
                             <div className="shrink-0 text-[#1a237e]">
                                <span className="material-symbols-outlined rotate-90 text-2xl">flight</span>
                             </div>
                         </div>
                         
                         {/* City Names Row (Below the line logic in the image) */}
                         <div className="flex justify-between items-center -mt-6 mb-12 px-1">
                             <div className="font-bold text-gray-800 text-sm w-1/3">
                                 {seg.departure_airport}
                             </div>
                             <div className="font-bold text-gray-800 text-sm w-1/3 text-right">
                                 {seg.arrival_airport} <span className="font-normal text-gray-500">({arr.time})</span>
                             </div>
                         </div>


                        {/* Vertical Connector Line (if there is a next segment) */}
                        {!isLast && (
                            <div className="absolute left-[27px] top-10 bottom-0 w-0.5 border-l-2 border-gray-300 border-dashed z-0 h-[calc(100%-20px)]"></div>
                        )}

                        {/* Layover Info (if exists) */}
                        {layover && (
                            <div className="ml-16 mb-12 relative z-10 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="material-symbols-outlined text-gray-400">hotel</span>
                                    <div className="text-xs font-bold uppercase">
                                        Transit in {layover.location}
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto">
                                         <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                                         <span className="text-xs font-bold">{layover.duration} Layover</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
