"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PassengerForm from "@/components/dashboard/routes/booking/PassengerForm";
import BookingSummary from "@/components/dashboard/routes/booking/BookingSummary";
import { FlightOffer } from "@/types/flight-search";

export default function FlightBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const adults = Math.max(0, Number(searchParams.get("adults") || "1") || 0);
  const children = Math.max(0, Number(searchParams.get("children") || "0") || 0);
  const infants = Math.max(0, Number(searchParams.get("infants") || "0") || 0);
  const totalPassengers = adults + children + infants || 1;
  const [passengers, setPassengers] = useState(Array.from({ length: totalPassengers }, (_, i) => i + 1));
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    base: number;
    total: number;
    currency: string;
    travelClass: string;
    tripType: string;
    passengers: Array<{
      travelerId: string;
      passengerType: string;
      title: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      dob?: string;
      gender?: string;
      documentType?: string;
      passportCountry?: string;
      passportNumber?: string;
      passportExpiryDate?: string;
      country?: string;
      countryCallingCode?: string;
      phone?: string;
      phoneDeviceType?: string;
    }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const offer: FlightOffer = useMemo(() => {
    const flightId = searchParams.get("flightId") || "1";
    const airlineName = searchParams.get("airlineName") || "Premium Carrier";
    const airlineCode = searchParams.get("airlineCode") || "PC";
    const flightNumber = searchParams.get("flightNumber") || "FL-101";
    const aircraft = searchParams.get("aircraft") || "Airbus A350";

    const depCity = searchParams.get("depCity") || "London";
    const depCode = searchParams.get("depCode") || "LHR";
    const depTime = searchParams.get("depTime") || "10:15";
    const depDate = searchParams.get("depDate") || "Oct 24";

    const arrCity = searchParams.get("arrCity") || "New York";
    const arrCode = searchParams.get("arrCode") || "JFK";
    const arrTime = searchParams.get("arrTime") || "14:00";
    const arrDate = searchParams.get("arrDate") || "Oct 24";

    const duration = searchParams.get("duration") || "7h 45m";
    const stopsCount = Number(searchParams.get("stops") || "0");
    const price = Number(searchParams.get("price") || "490");
    const currency = searchParams.get("currency") || "USD";

    return {
      id: flightId,
      airline: {
        name: airlineName,
        code: airlineCode,
        logo: "https://pics.avs.io/200/200/EK.png",
      },
      flightNumber,
      aircraft,
      departure: {
        city: depCity,
        code: depCode,
        time: depTime,
        date: depDate,
      },
      arrival: {
        city: arrCity,
        code: arrCode,
        time: arrTime,
        date: arrDate,
      },
      duration,
      stops: { count: Number.isNaN(stopsCount) ? 0 : stopsCount },
      price: Number.isNaN(price) ? 0 : price,
      currency,
    };
  }, [searchParams]);

  // const addPassenger = () => {
  //   setPassengers(prev => [...prev, Math.max(...prev) + 1]);
  // };

  const removePassenger = (id: number) => {
    setPassengers(prev => prev.filter((p) => p !== id));
  };

  const handleCreateBooking = async () => {
    if (creating) return;
    setCreating(true);
    try {
      setError(null);
      // const fareBrand = searchParams.get("fareBrand") || "";
      let rawPayload: unknown = null;
      try {
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(`selectedRawOffer:${offer.id}`) : null;
        rawPayload = cached ? JSON.parse(cached) : null;
      } catch {}
      if (!rawPayload) {
        if (typeof window !== "undefined") {
          alert("Unable to continue booking: missing selected offer. Please go back and select a fare brand.");
        }
        setCreating(false);
        return;
      }
      // Use local API for pricing
      const priceRes = await fetch("/api/amadeus/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flightOffer: rawPayload }),
      });

      if (!priceRes.ok) {
        let msg = "Price request failed";
        try {
          const j = await priceRes.json();
          msg = j?.error || j?.message || msg;
        } catch {}
        setError(msg);
        setCreating(false);
        return;
      }
      const priceJson = await priceRes.json();
      const rawData = priceJson.raw || {};
      const first = Array.isArray(rawData.data) ? rawData.data[0] : (rawData.data?.flightOffers?.[0] || rawData.data);
      if (!first) {
         setError("Pricing returned no valid offer");
         setCreating(false);
         return;
      }

      const priceObj = first?.price || {};
      const base = typeof priceObj?.base === "string" ? parseFloat(priceObj.base) : Number(priceObj?.base || 0);
      const total = typeof priceObj?.grandTotal === "string" ? parseFloat(priceObj.grandTotal) : (typeof priceObj?.total === "string" ? parseFloat(priceObj.total) : Number(priceObj?.grandTotal ?? priceObj?.total ?? 0));
      const currency = priceObj?.billingCurrency || priceObj?.currency || offer.currency;

      const travelerIds: string[] = (() => {
        if (!rawPayload || typeof rawPayload !== "object") return [];
        const rp = rawPayload as { travelerPricings?: unknown };
        const tpArr = rp.travelerPricings;
        if (!Array.isArray(tpArr)) return [];
        const out: string[] = [];
        for (const item of tpArr) {
          const tp = item as { travelerId?: unknown };
          const tid = tp?.travelerId;
          if (typeof tid === "string" || typeof tid === "number") {
            out.push(String(tid));
          }
        }
        return out;
      })();

      // Helper to map full country names to ISO 2-letter codes
      // This is a minimal map; in production use a library or full list
      const getIsoCountry = (name: string) => {
        const map: Record<string, string> = {
          "Nepal": "NP",
          "India": "IN",
          "Australia": "AU",
          "United States": "US",
          "United Kingdom": "GB",
          "China": "CN",
          "Japan": "JP",
          "France": "FR",
          "Germany": "DE",
          "Canada": "CA"
        };
        // If it's already 2 chars, assume code
        if (name.length === 2) return name.toUpperCase();
        return map[name] || "NP"; // Default fallback
      };

      const passengerInput = passengers.map((id, idx) => {
        const f = (typeof document !== "undefined" ? document.getElementById(`fname-${id}`) : null) as HTMLInputElement | null;
        const l = (typeof document !== "undefined" ? document.getElementById(`lname-${id}`) : null) as HTMLInputElement | null;
        
        // Optional fields
        const g = (typeof document !== "undefined" ? document.getElementById(`gender-${id}`) : null) as HTMLSelectElement | null;
        const d = (typeof document !== "undefined" ? document.getElementById(`dob-${id}`) : null) as HTMLInputElement | null;
        const c = (typeof document !== "undefined" ? document.getElementById(`country-${id}`) : null) as HTMLSelectElement | null;
        const p = (typeof document !== "undefined" ? document.getElementById(`passport-${id}`) : null) as HTMLInputElement | null;
        const pc = (typeof document !== "undefined" ? document.getElementById(`passportCountry-${id}`) : null) as HTMLSelectElement | null;
        const pe = (typeof document !== "undefined" ? document.getElementById(`passportExpiry-${id}`) : null) as HTMLInputElement | null;

        const firstName = (f?.value || "").trim() || "Unknown";
        const lastName = (l?.value || "").trim() || "Unknown";
        
        // Use provided values or defaults
        const genderRaw = (g?.value || "").trim();
        const gender = genderRaw && genderRaw !== "Select Gender" ? genderRaw : "MALE"; 
        
        const dobRaw = (d?.value || "").trim();
        const dob = dobRaw || "1990-01-01"; 

        const countryRaw = (c?.value || "").trim();
        const country = countryRaw && countryRaw !== "Select Country" ? getIsoCountry(countryRaw) : "NP";

        const passportNumber = (p?.value || "").trim();
        
        const passportCountryRaw = (pc?.value || "").trim();
        const passportCountry = passportCountryRaw && passportCountryRaw !== "Select Country" ? getIsoCountry(passportCountryRaw) : "NP";
        
        const passportExpiryDate = (pe?.value || "").trim();

        const passengerType =
          idx < adults ? "ADULT" : idx < adults + children ? "CHILD" : "INFANT";
        const title = gender === "MALE" ? "Mr" : gender === "FEMALE" ? "Ms" : "Mx";
        const middleName = "";
        const countryCallingCode = "977";
        const phone = "9840000000";
        const phoneDeviceType = "MOBILE";
        const travelerId = travelerIds[idx] || String(idx + 1);
        return {
          travelerId,
          passengerType,
          title,
          firstName,
          middleName,
          lastName,
          passportNumber,
          gender,
          dob,
          country,
          passportCountry,
          passportExpiryDate,
          documentType: "PASSPORT",
          countryCallingCode,
          phone,
          phoneDeviceType,
        };
      });
      
      // Transform to Amadeus Travelers
      const travelers = passengerInput.map(p => {
        const traveler: {
          id: string;
          dateOfBirth: string;
          name: { firstName: string; lastName: string };
          gender: string;
          contact: { emailAddress: string; phones: Array<{ deviceType: string; countryCallingCode: string; number: string }> };
          documents?: Array<{
            documentType: string;
            birthPlace: string;
            issuanceLocation: string;
            issuanceDate: string;
            number: string;
            expiryDate: string;
            issuanceCountry: string;
            validityCountry: string;
            nationality: string;
            holder: boolean;
          }>;
        } = {
          id: p.travelerId,
          dateOfBirth: p.dob,
          name: {
            firstName: p.firstName.toUpperCase(),
            lastName: p.lastName.toUpperCase()
          },
          gender: p.gender,
          contact: {
            emailAddress: "info@skytrips.com.au",
            phones: [{
              deviceType: "MOBILE",
              countryCallingCode: "61",
              number: "400000000"
            }]
          }
        };

        if (p.passportNumber && p.passportCountry && p.passportExpiryDate) {
          traveler.documents = [{
            documentType: "PASSPORT",
            birthPlace: p.country || p.passportCountry,
            issuanceLocation: p.passportCountry, 
            issuanceDate: "2015-01-01", // Default to a safe past date
            number: p.passportNumber,
            expiryDate: p.passportExpiryDate,
            issuanceCountry: p.passportCountry,
            validityCountry: p.passportCountry,
            nationality: p.passportCountry,
            holder: true
          }];
        }

        return traveler;
      });

      const bookingPayload = {
        flightOffers: [first],
        travelers
      };
      
      const bookingRes = await fetch("/api/amadeus/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      }).catch(() => null);
      const bookingJson = bookingRes ? await bookingRes.json().catch(() => null) : null;

      if (bookingRes && bookingRes.ok && bookingJson?.ok) {

        setSuccess(true);
        setSuccessData({
          base,
          total,
          currency,
          travelClass: (searchParams.get("class") || "ECONOMY").toUpperCase().replace(/\s+/g, "_"),
          tripType: (searchParams.get("type") || "One Way") === "One Way" ? "ONE_WAY" : (searchParams.get("type") || "One Way") === "Round Trip" ? "ROUND_TRIP" : "MULTI_CITY",
          passengers: passengerInput,
        });
      } else {
        let msg = "Booking request failed";
        if (bookingJson && typeof bookingJson === "object") {
          const bj = bookingJson as { error?: string; message?: string };
          msg = bj.error || bj.message || msg;
        }
        setError(msg);
      }

      // Skipping url replace to keep success state and show summary UI
    } catch {
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-display">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {!success && (
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span>Search Results</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-[#0EA5E9]">Traveller Information</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Traveller Info & Agency Commission
            </h1>
          </div>
        )}

        {!success && error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <p className="font-bold"> {error} </p>
            </div>
          </div>
        )}

        {!success && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          
          {/* Main Content - Passenger Forms */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm">
              {passengers.map((id, index) => {
                const isLead = index === 0;
                let typeLabel = "Adult";
                if (index >= adults && index < adults + children) typeLabel = "Child";
                if (index >= adults + children) typeLabel = "Infant";
                const label = isLead ? "Lead Traveller" : `Traveller ${index + 1} (${typeLabel})`;
                return (
                  <div key={id} className={index > 0 ? "mt-8 pt-8 border-t border-slate-100" : ""}>
                    <PassengerForm
                      id={id}
                      label={label}
                      onRemove={() => removePassenger(id)}
                      canRemove={index > 0}
                    />
                  </div>
                );
              })}

              <p className="text-xs font-medium text-[#0EA5E9] mt-6 italic">
                * Please ensure names match the passenger&apos;s valid government-issued ID.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">   
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-[#0F766E] hover:text-[#0D655E] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Flight Selection
              </button>

              <button onClick={handleCreateBooking} disabled={creating} className="bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-[#0F766E]/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                Create a booking
                <span className="material-symbols-outlined text-[20px] fill-current">check_circle</span>
              </button>
            </div>

          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-4">
             <BookingSummary
               offer={offer}
               passengers={{ adults, children, infants }}
               netFare={Number(searchParams.get("netFare") || "") || undefined}
               taxes={Number(searchParams.get("taxes") || "") || undefined}
               total={Number(searchParams.get("total") || "") || undefined}
             />
          </div>

        </div>
        )}

        {success && successData && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[28px]">check_circle</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Booking Created Successfully</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-500 uppercase">Total</p>
                <p className="text-2xl font-black text-primary">{successData.currency} {successData.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Route</p>
                <p className="text-sm font-bold text-slate-900">{offer.departure.code} → {offer.arrival.code}</p>
                <p className="text-xs text-slate-500">{offer.airline.name} • {offer.flightNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Class & Trip</p>
                <p className="text-sm font-bold text-slate-900">{successData.travelClass.replace(/_/g, " ")} • {successData.tripType.replace(/_/g, " ")}</p>
                <p className="text-xs text-slate-500">Base: {successData.currency} {successData.base.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">Travellers</p>
                <p className="text-sm font-bold text-slate-900">{successData.passengers.length}</p>
                <p className="text-xs text-slate-500">Adults {adults}, Children {children}, Infants {infants}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Traveller Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {successData.passengers.map((pax, i) => (
                  <div key={`${pax.travelerId}-${i}`} className="p-4 border border-slate-100 rounded-xl bg-white">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{pax.title} {pax.firstName} {pax.middleName ? `${pax.middleName} ` : ""}{pax.lastName}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">{pax.passengerType}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      {pax.dob && <p><span className="font-bold text-slate-500">DOB:</span> {pax.dob}</p>}
                      {pax.gender && <p><span className="font-bold text-slate-500">Gender:</span> {pax.gender}</p>}
                      {pax.passportCountry && <p><span className="font-bold text-slate-500">Passport Country:</span> {pax.passportCountry}</p>}
                      {pax.passportNumber && <p><span className="font-bold text-slate-500">Passport No:</span> {pax.passportNumber}</p>}
                      {pax.passportExpiryDate && <p><span className="font-bold text-slate-500">Expiry:</span> {pax.passportExpiryDate}</p>}
                      {pax.country && <p><span className="font-bold text-slate-500">Country:</span> {pax.country}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                onClick={() => {
                  setSuccess(false);
                  setSuccessData(null);
                }}
              >
                Back
              </button>
              <button
                className="h-10 px-4 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 shadow-sm transition-colors"
                onClick={() => router.push("/dashboard/booking")}
              >
                View All Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
