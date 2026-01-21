"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import FlightFilterSidebar from "@/components/dashboard/flights/FlightFilterSidebar";
import FlightResultCard from "@/components/dashboard/flights/FlightResultCard";
import { FlightOffer } from "@/types/flight-search";

interface RawSegment {
  departure?: {
    iataCode?: string;
    at?: string;
  };
  arrival?: {
    iataCode?: string;
    at?: string;
  };
  carrierCode?: string;
  number?: string;
  aircraft?: {
    code?: string;
  };
}

interface RawItinerary {
  duration?: string;
  segments?: RawSegment[];
}

interface RawFareRule {
  category?: string;
  notApplicable?: boolean;
}

interface RawAmenity {
  description?: string;
  isChargeable?: boolean;
  amenityType?: string;
}

interface RawFareDetailsBySegment {
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  class?: string;
  includedCheckedBags?: {
    quantity?: number;
  };
  includedCabinBags?: {
    quantity?: number;
  };
  amenities?: RawAmenity[];
}

interface RawTravelerPricing {
  price?: {
    currency?: string;
    total?: string | number;
    base?: string | number;
  };
  fareDetailsBySegment?: RawFareDetailsBySegment[];
}

interface RawFlightOffer {
  id?: string | number;
  itineraries?: RawItinerary[];
  price?: {
    grandTotal?: string | number;
    total?: string | number;
    currency?: string;
  };
  validatingAirlineCodes?: string[];
  oneWay?: boolean;
  fareRules?: {
    rules?: RawFareRule[];
  };
  travelerPricings?: RawTravelerPricing[];
  samePriceOffers?: RawFlightOffer[];
}

interface RawDictionaries {
  locations?: Record<string, { cityCode?: string; countryCode?: string }>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
  carriers?: Record<string, string>;
  priceRange?: { min?: number; max?: number };
  transitOptions?: { direct?: number; oneStop?: number; twoPlusStops?: number };
  departureTimes?: { min?: string; max?: string };
  arrivalTimes?: { min?: string; max?: string };
  airlines?: Array<{ code?: string; name?: string; flightCount?: number; position?: number }>;
}

interface RawApiResponse {
  data?: RawFlightOffer[];
  dictionaries?: RawDictionaries;
}

function FlightResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [rawDictionaries, setRawDictionaries] = useState<RawDictionaries | undefined>(undefined);
  const rawOffersByIdRef = useRef<Record<string, RawFlightOffer>>({});

  // Extract params
  const originParam = searchParams.get("origin") || "";
  const destinationParam = searchParams.get("destination") || "";
  const departParam = searchParams.get("depart") || "";
  const returnParam = searchParams.get("return") || "";
  const adultsParam = searchParams.get("adults") || "1";
  const childrenParam = searchParams.get("children") || "0";
  const infantsParam = searchParams.get("infants") || "0";
  const classParam = searchParams.get("class") || "Economy";
  const typeParam = searchParams.get("type") || "Round Trip";
  const timeSlotParam = searchParams.get("timeSlot") || "";
  const stopsParam = (searchParams.get("stops") || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const priceMinParam = searchParams.get("pMin");
  const priceMaxParam = searchParams.get("pMax");
  const cacheKey = searchParams.get("k") || "";

  const origin = originParam || "LHR";
  const destination = destinationParam || "JFK";
  const departDate = departParam || "Oct 24";
  const returnDate = returnParam || "Oct 31";
  const airlinesParam = (searchParams.get("airlines") || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
  const directOnly = (searchParams.get("direct") || "") === "1";
  const refundableOnly = (searchParams.get("refundable") || "") === "1";
  const sortKey = searchParams.get("sort") || "recommended";
  const priceFilterMin = priceMinParam ? Number(priceMinParam) : undefined;
  const priceFilterMax = priceMaxParam ? Number(priceMaxParam) : undefined;

  const replaceParams = (mutator: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutator(next);
    router.replace(`?${next.toString()}`);
  };

  const handleClearAll = () => {
    replaceParams((p) => {
      p.delete("airlines");
      p.delete("direct");
      p.delete("refundable");
    });
  };

  const handleRemoveAirline = (code: string) => {
    const nextAirlines = airlinesParam.filter((c) => c !== code.toUpperCase());
    replaceParams((p) => {
      if (nextAirlines.length > 0) {
        p.set("airlines", nextAirlines.join(","));
      } else {
        p.delete("airlines");
      }
    });
  };

  const handleToggleDirect = () => {
    replaceParams((p) => {
      if (directOnly) {
        p.delete("direct");
      } else {
        p.set("direct", "1");
      }
    });
  };

  const handleToggleRefundable = () => {
    replaceParams((p) => {
      if (refundableOnly) {
        p.delete("refundable");
      } else {
        p.set("refundable", "1");
      }
    });
  };

  const handleToggleAirline = (code: string) => {
    const normalized = code.toUpperCase();
    const nextAirlines = airlinesParam.includes(normalized)
      ? airlinesParam.filter((c) => c !== normalized)
      : [...airlinesParam, normalized];
    replaceParams((p) => {
      if (nextAirlines.length > 0) {
        p.set("airlines", nextAirlines.join(","));
      } else {
        p.delete("airlines");
      }
    });
  };

  const handleSortChange = (val: string) => {
    replaceParams((p) => {
      if (val === "recommended") {
        p.delete("sort");
      } else {
        p.set("sort", val);
      }
    });
  };

  const handlePriceRangeChange = (min?: number, max?: number) => {
    replaceParams((p) => {
      if (typeof min === "number") {
        p.set("pMin", String(Math.round(min)));
      } else {
        p.delete("pMin");
      }
      if (typeof max === "number") {
        p.set("pMax", String(Math.round(max)));
      } else {
        p.delete("pMax");
      }
    });
  };

  const handleToggleStops = (val: string) => {
    const nextStops = stopsParam.includes(val)
      ? stopsParam.filter((s) => s !== val)
      : [...stopsParam, val];
    replaceParams((p) => {
      if (nextStops.length > 0) {
        p.set("stops", nextStops.join(","));
      } else {
        p.delete("stops");
      }
    });
  };

  const handleTimeSlotChange = (id: string) => {
    replaceParams((p) => {
      if (!id || timeSlotParam === id) {
        p.delete("timeSlot");
      } else {
        p.set("timeSlot", id);
      }
    });
  };

  const mapRawToOffers = (raw: RawFlightOffer[], dictionaries?: RawDictionaries): FlightOffer[] =>
    (raw || []).map((offer): FlightOffer => {
      const itinerary = Array.isArray(offer.itineraries) ? offer.itineraries[0] : undefined;
      const segments: RawSegment[] = itinerary?.segments || [];
      const first = segments[0] || {};
      const last = segments[segments.length - 1] || {};
      const priceAmount = Number(offer?.price?.grandTotal || offer?.price?.total || 0);
      const currencyCode = offer?.price?.currency || "USD";
      const currencyName = dictionaries?.currencies?.[currencyCode];
      const currency = currencyName ? currencyCode : currencyCode;
      const carrierCode =
        first?.carrierCode ||
        (Array.isArray(offer?.validatingAirlineCodes) ? offer.validatingAirlineCodes[0] : "") ||
        "";
      const carrierName = (carrierCode && dictionaries?.carriers?.[carrierCode]) || carrierCode;
      const flightNumber = `${first?.carrierCode || ""}-${first?.number || ""}`.trim();
      const depAt = first?.departure?.at;
      const arrAt = last?.arrival?.at;
      const refundRule = Array.isArray(offer?.fareRules?.rules)
        ? offer.fareRules.rules.find((r) => r?.category === "REFUND")
        : undefined;
      const isRefundableFromRules = !!(refundRule && refundRule.notApplicable !== true);
      const isRefundableFromAmenities =
        Array.isArray(offer?.travelerPricings) &&
        offer.travelerPricings.some((tp) =>
          Array.isArray(tp?.fareDetailsBySegment) &&
          tp.fareDetailsBySegment.some((fd) =>
            Array.isArray(fd?.amenities) &&
            fd.amenities.some((a) => {
              if (typeof a?.description !== "string") return false;
              const desc = a.description.toLowerCase();
              return desc.includes("refund");
            })
          )
        );
      const tags: string[] = [];
      if (offer?.oneWay) tags.push("One Way");
      if (isRefundableFromRules || isRefundableFromAmenities) tags.push("Refundable");
      const aircraftCode = first?.aircraft?.code;
      const aircraftName = (aircraftCode && dictionaries?.aircraft?.[aircraftCode]) || aircraftCode;
      return {
        id: String(offer?.id || Math.random()),
        airline: {
          name: carrierName,
          code: carrierCode,
          logo: carrierCode ? `https://pics.avs.io/300/300/${carrierCode}.png` : undefined,
        },
        flightNumber,
        aircraft: aircraftName,
        departure: {
          city: first?.departure?.iataCode || "",
          code: first?.departure?.iataCode || "",
          time: depAt ? new Date(depAt).toISOString().slice(11, 16) : "",
          date: depAt ? new Date(depAt).toISOString().slice(0, 10) : undefined,
        },
        arrival: {
          city: last?.arrival?.iataCode || "",
          code: last?.arrival?.iataCode || "",
          time: arrAt ? new Date(arrAt).toISOString().slice(11, 16) : "",
          date: arrAt ? new Date(arrAt).toISOString().slice(0, 10) : undefined,
        },
        duration: itinerary?.duration || "",
        stops: {
          count: Math.max(segments.length - 1, 0),
          locations: segments.slice(1, -1).map((s) => s?.departure?.iataCode).filter(Boolean),
        },
        price: priceAmount,
        currency,
        tags: tags.length > 0 ? tags : undefined,
      };
    });

  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeParam !== "Multi-city" && (!originParam || !destinationParam || !departParam)) {
      setLoading(false);
      setFlights([]);
      setRawDictionaries(undefined);
      lastFetchKeyRef.current = null;
      return;
    }

    const fetchKey = JSON.stringify({
      origin: originParam,
      destination: destinationParam,
      depart: departParam,
      return: returnParam,
      adults: adultsParam,
      children: childrenParam,
      infants: infantsParam,
      class: classParam,
      typeParam,
      cacheKey,
    });

    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    const fetchOffers = async () => {
      setLoading(true);
      try {
        if (typeParam === "Multi-city" && cacheKey) {
          const cached = typeof window !== "undefined" ? sessionStorage.getItem(`amadeusCache:${cacheKey}`) : null;
          if (cached) {
            const rawObj = JSON.parse(cached) as RawApiResponse;
            const offers = rawObj.data || [];
            setRawDictionaries(rawObj.dictionaries);
            rawOffersByIdRef.current = {};
            offers.forEach((offer) => {
              if (offer?.id !== undefined && offer?.id !== null) {
                const id = String(offer.id);
                rawOffersByIdRef.current[id] = offer;
              }
            });
            setFlights(mapRawToOffers(offers, rawObj.dictionaries));
          } else {
            setFlights([]);
          }
        } else {
          const params = new URLSearchParams({
            origin: originParam,
            destination: destinationParam,
            depart: departParam,
            return: returnParam,
            adults: adultsParam,
            children: childrenParam,
            infants: infantsParam,
            class: classParam,
            type: typeParam,
          });
          const res = await fetch(`/api/amadeus/search?${params.toString()}`);
          const json = await res.json();
          if (!res.ok || !json.ok) {
            console.error("Amadeus search error:", json);
            setFlights([]);
          } else {
            const rawObj = (json.raw || {}) as RawApiResponse;
            const offers = rawObj.data || [];
            setRawDictionaries(rawObj.dictionaries);
            rawOffersByIdRef.current = {};
            offers.forEach((offer) => {
              if (offer?.id !== undefined && offer?.id !== null) {
                const id = String(offer.id);
                rawOffersByIdRef.current[id] = offer;
              }
            });
            setFlights(mapRawToOffers(offers, rawObj.dictionaries));
          }
        }
      } catch (e) {
        console.error("Fetch failed:", e);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [originParam, destinationParam, departParam, returnParam, adultsParam, childrenParam, infantsParam, classParam, typeParam, cacheKey]);

  const getRawOfferById = (id: string) => rawOffersByIdRef.current[id];

  const filteredFlights = flights.filter((offer) => {
    if (airlinesParam.length > 0 && !airlinesParam.includes((offer.airline.code || "").toUpperCase())) {
      return false;
    }
    if (directOnly && (offer.stops?.count ?? 0) !== 0) {
      return false;
    }
    if (refundableOnly) {
      const tags = offer.tags || [];
      const hasRefundable = tags.some((t) => t.toLowerCase() === "refundable");
      if (!hasRefundable) return false;
    }
    if (timeSlotParam) {
      const t = offer.departure.time;
      if (!t) return false;
      const parts = t.split(":");
      if (parts.length < 2) return false;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (Number.isNaN(h) || Number.isNaN(m)) return false;
      const mins = h * 60 + m;
      let ok = false;
      if (timeSlotParam === "early" && mins >= 0 && mins < 360) ok = true;
      if (timeSlotParam === "daytime" && mins >= 360 && mins < 720) ok = true;
      if (timeSlotParam === "evening" && mins >= 720 && mins < 1080) ok = true;
      if (timeSlotParam === "night" && mins >= 1080 && mins < 1440) ok = true;
      if (!ok) return false;
    }
    if (stopsParam.length > 0) {
      const count = offer.stops?.count ?? 0;
      let matches = false;
      if (stopsParam.includes("0") && count === 0) matches = true;
      if (stopsParam.includes("1") && count === 1) matches = true;
      if (stopsParam.includes("2+") && count >= 2) matches = true;
      if (!matches) return false;
    }
    if (typeof priceFilterMin === "number" || typeof priceFilterMax === "number") {
      const p = offer.price || 0;
      if (typeof priceFilterMin === "number" && p < priceFilterMin) return false;
      if (typeof priceFilterMax === "number" && p > priceFilterMax) return false;
    }
    return true;
  });

  const toMinutes = (dur: string) => {
    const m = dur.match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/i);
    if (!m) return Number.MAX_SAFE_INTEGER;
    const h = Number(m[1] || 0);
    const min = Number(m[2] || 0);
    return h * 60 + min;
  };

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortKey === "price_asc") {
      return (a.price || 0) - (b.price || 0);
    }
    if (sortKey === "duration_asc") {
      return toMinutes(a.duration || "") - toMinutes(b.duration || "");
    }
    return 0;
  });

  const visibleFlights = sortedFlights.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Sticky Header Summary */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{(origin.match(/\(([^)]+)\)\s*$/)?.[1] || origin).split(' ')[0]}</span>
              <span className="material-symbols-outlined text-slate-400">arrow_right_alt</span>
              <span className="text-2xl font-black text-slate-900">{(destination.match(/\(([^)]+)\)\s*$/)?.[1] || destination).split(' ')[0]}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
               <span className="material-symbols-outlined text-primary">calendar_month</span>
               {typeParam === "One Way" ? departDate : `${departDate} - ${returnDate}`}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
             {refundableOnly && (
               <button onClick={handleToggleRefundable} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap">
                 Refundable
                 <span className="material-symbols-outlined text-[14px]">close</span>
               </button>
             )}
             {directOnly && (
               <button onClick={handleToggleDirect} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap">
                 Direct Only
                 <span className="material-symbols-outlined text-[14px]">close</span>
               </button>
             )}
             {airlinesParam.map((a) => (
               <button key={a} onClick={() => handleRemoveAirline(a)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 whitespace-nowrap">
                 {a}
                 <span className="material-symbols-outlined text-[14px]">close</span>
               </button>
             ))}
             <button onClick={handleClearAll} className="text-xs font-bold text-primary hover:underline ml-2 whitespace-nowrap">Clear All</button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/dashboard/flights" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Search
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <aside className="lg:col-span-1 hidden lg:block">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200 rounded" />
                  <div className="h-3 w-4/6 bg-slate-200 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-4/5 bg-slate-200 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-3/4 bg-slate-200 rounded" />
                </div>
              </div>
            ) : (
              <FlightFilterSidebar
                selectedAirlines={airlinesParam}
                selectedStops={stopsParam}
                directOnly={directOnly}
                refundableOnly={refundableOnly}
                priceRange={rawDictionaries?.priceRange}
                priceFilterMin={priceFilterMin}
                priceFilterMax={priceFilterMax}
                transitOptions={rawDictionaries?.transitOptions}
                departureTimes={rawDictionaries?.departureTimes}
                arrivalTimes={rawDictionaries?.arrivalTimes}
                airlinesSummary={rawDictionaries?.airlines}
                onToggleDirect={handleToggleDirect}
                onToggleRefundable={handleToggleRefundable}
                onToggleAirline={handleToggleAirline}
                onToggleStop={handleToggleStops}
                onChangePriceRange={handlePriceRangeChange}
                selectedTime={timeSlotParam || undefined}
                onChangeTime={handleTimeSlotChange}
              />
            )}
          </aside>

          {/* Results List */}
          <div className="lg:col-span-3">
            
            {/* Sort & Count Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{visibleFlights.length}</span> flights found
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
                <select
                  value={sortKey}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-sm font-bold text-primary border-none focus:ring-0 cursor-pointer py-0 pl-2 pr-8"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Cheapest First</option>
                  <option value="duration_asc">Fastest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-primary/5 via-sky-50 to-emerald-50 border border-primary/10 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl animate-bounce">flight_takeoff</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Searching the best fares for you
                      </p>
                      <p className="text-xs text-slate-500">
                        This can take a few seconds while we scan multiple airlines
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">travel_explore</span>
                      <span>{origin} → {destination}</span>
                    </div>
                    <span className="h-5 w-px bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-base">schedule</span>
                      <span>
                        {typeParam === "One Way" ? departDate : `${departDate} – ${returnDate}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded" />
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                          </div>
                        </div>
                        <div className="h-6 w-16 bg-slate-200 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-20 bg-slate-200 rounded" />
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                          <div className="h-3 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="flex-1 flex flex-col items-end gap-2">
                          <div className="h-5 w-24 bg-slate-200 rounded" />
                          <div className="h-9 w-28 bg-slate-200 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleFlights.map(offer => (
                  <FlightResultCard key={offer.id} offer={offer} getRawOffer={getRawOfferById} />
                ))}

                {/* Load More */}
                <button
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="w-full py-4 bg-white border border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-primary hover:text-primary transition-all mt-8"
                >
                  Load More Results
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <FlightResultsContent />
    </Suspense>
  );
}
