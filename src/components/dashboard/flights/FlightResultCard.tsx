"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlightOffer, FareBrand } from "@/types/flight-search";
import FlightDetailsModal from "./FlightDetailsModal";
import FareBrandsCarousel from "./FareBrandsCarousel";

interface RawAmenity {
  description?: string;
  isChargeable?: boolean;
}

interface RawFareDetailsBySegment {
  brandedFare?: string;
  brandedFareLabel?: string;
  cabin?: string;
  includedCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
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

interface RawFlightOfferLike {
  id?: string | number;
  price?: {
    billingCurrency?: string;
    base?: string | number;
    grandTotal?: string | number;
    total?: string | number;
    currency?: string;
  };
  travelerPricings?: RawTravelerPricing[];
}

interface FlightResultCardProps {
  offer: FlightOffer;
  getRawOffer?: (id: string) => RawFlightOfferLike | undefined;
}

const buildFareBrandFromRaw = (fo: RawFlightOfferLike, index: number): FareBrand | null => {
  const travelerPricing = Array.isArray(fo.travelerPricings) ? fo.travelerPricings[0] : undefined;
  const fareDetails = Array.isArray(travelerPricing?.fareDetailsBySegment)
    ? travelerPricing?.fareDetailsBySegment[0]
    : undefined;
  const totalRaw = fo.price?.grandTotal ?? fo.price?.total ?? travelerPricing?.price?.total;
  const total = Number(totalRaw || 0);
  if (!total || Number.isNaN(total)) return null;
  const currencyCode = fo.price?.currency || travelerPricing?.price?.currency || "USD";
  const amenities = Array.isArray(fareDetails?.amenities) ? fareDetails.amenities : [];

  const weight = typeof fareDetails?.includedCheckedBags?.weight === "number"
    ? fareDetails.includedCheckedBags.weight
    : undefined;
  const weightUnit = fareDetails?.includedCheckedBags?.weightUnit || "KG";
  const hasChecked = typeof weight === "number" && weight > 0;

  const rawCabinQty = fareDetails?.includedCabinBags?.quantity;
  let cabinQty: number | undefined;
  let hasExplicitNoCabin = false;

  if (typeof rawCabinQty === "number") {
    if (rawCabinQty <= 0) {
      hasExplicitNoCabin = true;
    } else {
      cabinQty = rawCabinQty;
    }
  } else {
    cabinQty = 1;
  }

  const features: { included: boolean; text: string }[] = [];

  if (hasChecked) {
    features.push({
      included: true,
      text: `${weight} ${weightUnit} Checked Baggage`,
    });
  } else {
    features.push({ included: false, text: "No Checked Baggage" });
  }

  if (hasExplicitNoCabin) {
    features.push({ included: false, text: "No Cabin Bag" });
  } else {
    const qty = cabinQty && cabinQty > 0 ? cabinQty : 1;
    features.push({
      included: true,
      text: `${qty} Cabin Bag${qty > 1 ? "s" : ""}`,
    });
  }

  let hasFreeChange = false;
  let hasPaidChange = false;
  let hasFreeRefund = false;
  let hasPaidRefund = false;

  amenities.forEach((a) => {
    if (!a || typeof a.description !== "string") return;
    const desc = a.description.toLowerCase();
    const chargeable = a.isChargeable === true;

    if (desc.includes("change before") || desc.includes("change after")) {
      if (chargeable) hasPaidChange = true;
      else hasFreeChange = true;
    }
    if (desc.includes("refund before") || desc.includes("refund after")) {
      if (chargeable) hasPaidRefund = true;
      else hasFreeRefund = true;
    }
  });

  if (hasFreeChange || hasPaidChange) {
    if (hasFreeChange && !hasPaidChange) {
      features.push({ included: true, text: "Free Date Changes" });
    } else {
      features.push({ included: true, text: "Date Changes (fee may apply)" });
    }
  } else {
    features.push({ included: false, text: "No Date Changes" });
  }

  if (hasFreeRefund || hasPaidRefund) {
    if (hasFreeRefund && !hasPaidRefund) {
      features.push({ included: true, text: "Refundable" });
    } else {
      features.push({ included: true, text: "Refund fee applies" });
    }
  } else {
    features.push({ included: false, text: "Non-refundable" });
  }

  if (fareDetails?.cabin) {
    features.push({
      included: true,
      text: `${fareDetails.cabin.charAt(0)}${fareDetails.cabin.slice(1).toLowerCase()} Cabin`,
    });
  }

  const name =
    fareDetails?.brandedFareLabel ||
    fareDetails?.brandedFare ||
    `Fare ${index + 1}`;

  return {
    id: String(fo.id ?? index),
    name,
    price: total,
    currency: currencyCode,
    features,
  };
};

export default function FlightResultCard({ offer, getRawOffer }: FlightResultCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFares, setShowFares] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
   const [fareBrands, setFareBrands] = useState<FareBrand[] | null>(
    Array.isArray(offer.fareBrands) ? offer.fareBrands : null
  );
  const [faresLoading, setFaresLoading] = useState(false);
  const [faresError, setFaresError] = useState<string | null>(null);

  const loadFareBrands = async () => {
    if (!getRawOffer) return;
    const raw = getRawOffer(offer.id);
    if (!raw) return;

    setFaresLoading(true);
    setFaresError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.skytrips.com.au/";
      const clientRef = process.env.NEXT_PUBLIC_SKYTRIPS_CLIENT_REF || "1223";
      const url = new URL("flight-branded-fares-upsell", baseUrl);
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "10");

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ama-client-ref": clientRef,
          accept: "application/json",
        },
        body: JSON.stringify(raw),
      });

      if (!res.ok) {
        setFaresError("Failed to load branded fares");
        setFareBrands(null);
        return;
      }

      const json = await res.json();
      const items: RawFlightOfferLike[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
        ? json
        : [];

      const brands: FareBrand[] = [];
      const parentBrand = buildFareBrandFromRaw(raw, 0);

      if (items.length > 0) {
        const firstFromApi = buildFareBrandFromRaw(items[0], 0);
        const isDuplicate =
          parentBrand &&
          firstFromApi &&
          firstFromApi.price === parentBrand.price &&
          firstFromApi.name === parentBrand.name;

        if (isDuplicate) {
          if (firstFromApi) {
            brands.push(firstFromApi);
          }
          for (let i = 1; i < items.length; i += 1) {
            const brand = buildFareBrandFromRaw(items[i], brands.length);
            if (brand) {
              brands.push(brand);
            }
          }
        } else {
          if (parentBrand) {
            brands.push(parentBrand);
          }
          items.forEach((item: RawFlightOfferLike) => {
            const brand = buildFareBrandFromRaw(item, brands.length);
            if (brand) {
              brands.push(brand);
            }
          });
        }
      } else if (parentBrand) {
        brands.push(parentBrand);
      }

      if (brands.length > 1) {
        for (let i = 0; i < brands.length; i += 1) {
          brands[i] = { ...brands[i], recommended: i === 1 };
        }
      }

      setFareBrands(brands);
    } catch {
      setFaresError("Failed to load branded fares");
    } finally {
      setFaresLoading(false);
    }
  };

  const handleToggleFares = () => {
    const next = !showFares;
    setShowFares(next);
    if (next && !fareBrands && !faresLoading) {
      loadFareBrands();
    }
  };

  const triggerBackgroundPriceCheck = (brandId: string) => {
    try {
      if (!getRawOffer) return;
      const raw = getRawOffer(offer.id);
      if (!raw) return;

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.skytrips.com.au/";
      const clientRef = process.env.NEXT_PUBLIC_SKYTRIPS_CLIENT_REF || "1223";
      const url = new URL("flight-price", baseUrl);
      url.searchParams.set("page", "1");
      url.searchParams.set("limit", "10");

      const payload = { ...raw, selectedFareBrandId: brandId };

      void fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ama-client-ref": clientRef,
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("Price check request failed", error);
      });
    } catch (error) {
      console.error("Price check trigger error", error);
    }
  };

  const handleSelectFare = (brandId: string) => {
    triggerBackgroundPriceCheck(brandId);

    const selectedBrand = Array.isArray(fareBrands)
      ? fareBrands.find((b) => b.id === brandId)
      : undefined;

    setIsNavigating(true);

    let computedNetFare = "";
    let computedTaxes = "";
    let computedTotal = "";
    try {
      if (getRawOffer) {
        const raw = getRawOffer(offer.id);
        const baseRaw = raw?.price?.base as string | number | undefined;
        const totalRaw = raw?.price?.grandTotal ?? raw?.price?.total as string | number | undefined;
        const base = typeof baseRaw === "string" ? parseFloat(baseRaw) : Number(baseRaw || 0);
        const total = typeof totalRaw === "string" ? parseFloat(totalRaw) : Number(totalRaw || 0);
        let taxes = Number.isFinite(base) && Number.isFinite(total) ? total - base : 0;
        if (!Number.isFinite(base) || base === 0) {
          const fallbackBase = Array.isArray(raw?.travelerPricings)
            ? raw!.travelerPricings.reduce((sum, tp) => {
                const b = tp?.price?.base as string | number | undefined;
                const v = typeof b === "string" ? parseFloat(b) : Number(b || 0);
                return sum + (Number.isFinite(v) ? v : 0);
              }, 0)
            : 0;
          if (Number.isFinite(fallbackBase)) {
            computedNetFare = String(fallbackBase.toFixed(2));
            taxes = Number.isFinite(total) ? total - fallbackBase : taxes;
          }
        } else {
          computedNetFare = String(base.toFixed(2));
        }
        if (Number.isFinite(taxes)) computedTaxes = String(Math.max(taxes, 0).toFixed(2));
        if (Number.isFinite(total)) computedTotal = String(total.toFixed(2));
      }
    } catch {}

    // Read passenger counts from current search params
    const currentParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const adults = currentParams.get("adults") || "1";
    const children = currentParams.get("children") || "0";
    const infants = currentParams.get("infants") || "0";

    let currencyCode = offer.currency;
    try {
      if (getRawOffer) {
        const raw = getRawOffer(offer.id);
        currencyCode = raw?.price?.billingCurrency || raw?.price?.currency || currencyCode;
      }
    } catch {}

    const params = new URLSearchParams({
      flightId: offer.id,
      fareBrand: brandId,
      airlineName: offer.airline.name,
      airlineCode: offer.airline.code,
      flightNumber: offer.flightNumber,
      aircraft: offer.aircraft || "",
      depCity: offer.departure.city,
      depCode: offer.departure.code,
      depTime: offer.departure.time,
      depDate: offer.departure.date || "",
      arrCity: offer.arrival.city,
      arrCode: offer.arrival.code,
      arrTime: offer.arrival.time,
      arrDate: offer.arrival.date || "",
      duration: offer.duration,
      stops: String(offer.stops?.count ?? 0),
      price: String(selectedBrand?.price ?? offer.price),
      currency: currencyCode || selectedBrand?.currency || offer.currency,
      adults,
      children,
      infants,
      netFare: computedNetFare,
      taxes: computedTaxes,
      total: computedTotal,
    });

    router.push(`/dashboard/flights/book?${params.toString()}`);
  };

  return (
    <>
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all duration-300 group ${
        showFares ? 'ring-2 ring-primary border-primary shadow-md' : 'hover:shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Airline Logo & Info */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
              {/* Use an image if available, else a generic icon */}
              {offer.airline.logo ? (
                  <img src={offer.airline.logo} alt={offer.airline.name} className="w-14 h-14 object-contain" />
              ) : (
                  <span className="material-symbols-outlined">flight_sm</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{offer.airline.name}</h3>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{offer.flightNumber} • {offer.aircraft}</p>
            </div>
          </div>

          {/* Flight Route & Duration */}
          <div className="flex-1 flex items-center justify-between w-full px-4">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{offer.departure.time}</p>
              <p className="text-sm font-bold text-slate-500">{offer.departure.code}</p>
            </div>

            {/* Visualization */}
            <div className="flex flex-col items-center flex-1 px-4">
              <p className="text-xs text-slate-400 mb-1">{offer.duration}</p>
              <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-center">
                <div className="w-full absolute top-0 h-full bg-slate-200"></div>
                {/* Stops indicators */}
                {offer.stops.count === 0 ? (
                  <div className="bg-white px-2 z-10 text-[10px] font-bold text-blue-500 uppercase tracking-wider">Non-stop</div>
                ) : (
                  <div className="flex items-center gap-1 bg-white px-2 z-10">
                      <span className="w-2 h-2 rounded-full border-2 border-slate-300"></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{offer.stops.count} Stop ({offer.stops.locations?.join(", ")})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">{offer.arrival.time}</p>
              <p className="text-sm font-bold text-slate-500">{offer.arrival.code}</p>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col items-end gap-3 w-full md:w-auto min-w-[140px]">
            <button 
              onClick={handleToggleFares}
              className={`w-full py-2.5 px-4 font-bold rounded-lg shadow-lg transition-all ${
                  showFares 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none" 
                  : "bg-primary text-white shadow-blue-500/20 hover:bg-blue-600 active:scale-95"
              }`}
              aria-expanded={showFares}
              aria-controls={`fares-${offer.id}`}
            >
              {showFares ? "Hide Fares" : "Select Flight"}
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 px-4 bg-white text-slate-600 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm"
            >
              View Details
            </button>
          </div>
        </div>

        {showFares && (
          <div
            id={`fares-${offer.id}`}
            className={`mt-5 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 md:px-6 md:py-5 transition-all ${
              isNavigating ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total fare for selected flight
                </p>
                <p className="text-2xl md:text-3xl font-black text-slate-900">
                  {offer.currency} {offer.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] md:text-xs text-slate-500">
                <span className="material-symbols-outlined text-primary text-base md:text-lg">
                  info
                </span>
                <span className="leading-snug">
                  Choose a fare brand below to see baggage and flexibility options.
                </span>
              </div>
            </div>

            {faresError && (
              <div className="mb-3 text-xs font-medium text-red-600">
                {faresError}
              </div>
            )}

            {faresLoading && (
              <div className="h-24 flex items-center justify-center text-xs text-slate-500">
                Loading branded fares...
              </div>
            )}

            {!faresLoading && !faresError && Array.isArray(fareBrands) && fareBrands.length > 0 && (
              <FareBrandsCarousel brands={fareBrands} onSelect={handleSelectFare} />
            )}
          </div>
        )}
      </div>

      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             <p className="text-sm font-bold text-primary">Proceeding to booking...</p>
          </div>
        </div>
      )}

      <FlightDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        offer={offer} 
      />
    </>
  );
}
