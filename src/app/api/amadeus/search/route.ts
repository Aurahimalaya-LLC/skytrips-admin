import { NextResponse } from "next/server";
import type { FlightOffer } from "@/types/flight-search";

export const runtime = "nodejs";

function getEnv(key: string, fallback = "") {
  return process.env[key] || fallback;
}

function parseIata(input?: string): string {
  if (!input) return "";
  const match = input.match(/\(([^)]+)\)\s*$/);
  if (match) return match[1].trim();
  // Fallback: if user typed code directly
  if (/^[A-Z]{3}$/.test(input.trim())) return input.trim();
  // Last token may be code
  const tokens = input.trim().split(/\s+/);
  const last = tokens[tokens.length - 1];
  if (/^[A-Z]{3}$/.test(last)) return last;
  return input.trim();
}

async function getAccessToken() {
  const baseUrl = getEnv("NEXT_PUBLIC_AMADEUS_BASE_URL", "https://test.travel.api.amadeus.com/");
  const clientId = getEnv("NEXT_PUBLIC_AMADEUS_API_KEY");
  const clientSecret = getEnv("NEXT_PUBLIC_AMADEUS_API_SECRET");
  const oauthUri = getEnv("NEXT_PUBLIC_AMADEUS_OAUTH_URI", "v1/security/oauth2/token");

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus credentials missing");
  }

  const url = new URL(oauthUri, baseUrl).toString();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  }).toString();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Amadeus OAuth failed: ${res.status} ${errText}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

interface AmadeusSegment {
  carrierCode?: string;
  number?: string;
  aircraft?: { code?: string };
  departure?: { iataCode?: string; at?: string };
  arrival?: { iataCode?: string; at?: string };
}

interface AmadeusItinerary {
  segments: AmadeusSegment[];
  duration?: string;
}

interface AmadeusOffer {
  id: string;
  itineraries?: AmadeusItinerary[];
  price?: { grandTotal?: string; total?: string; currency?: string };
  validatingAirlineCodes?: string[];
  oneWay?: boolean;
}

function mapOffers(data: AmadeusOffer[]): FlightOffer[] {
  return (data || []).map((offer: AmadeusOffer) => {
    const itinerary = offer.itineraries?.[0];
    const segments: AmadeusSegment[] = itinerary?.segments || [];
    const first = segments[0] || {};
    const last = segments[segments.length - 1] || {};
    const priceAmount = Number(offer.price?.grandTotal || offer.price?.total || 0);
    const currency = offer.price?.currency || "USD";
    const carrier = first.carrierCode || offer.validatingAirlineCodes?.[0] || "";
    const flightNumber = `${first.carrierCode || ""}-${first.number || ""}`.trim();

    return {
      id: offer.id,
      airline: {
        name: carrier,
        code: carrier,
        logo: `https://pics.avs.io/300/300/${carrier}.png`,
      },
      flightNumber,
      aircraft: first.aircraft?.code,
      departure: {
        city: first.departure?.iataCode || "",
        code: first.departure?.iataCode || "",
        time: first.departure?.at ? new Date(first.departure.at).toISOString().slice(11, 16) : "",
        date: first.departure?.at ? new Date(first.departure.at).toISOString().slice(0, 10) : undefined,
      },
      arrival: {
        city: last.arrival?.iataCode || "",
        code: last.arrival?.iataCode || "",
        time: last.arrival?.at ? new Date(last.arrival.at).toISOString().slice(11, 16) : "",
        date: last.arrival?.at ? new Date(last.arrival.at).toISOString().slice(0, 10) : undefined,
      },
      duration: itinerary?.duration || "",
      stops: {
        count: Math.max(segments.length - 1, 0),
        locations: segments.slice(1, -1).map((s: AmadeusSegment) => s.departure?.iataCode).filter(Boolean),
      },
      price: priceAmount,
      currency,
      tags: offer.oneWay ? ["One Way"] : undefined,
    };
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const originInput = searchParams.get("origin") || "";
    const destinationInput = searchParams.get("destination") || "";
    const departDate = searchParams.get("depart") || "";
    const returnDate = searchParams.get("return") || "";
    const adults = Number(searchParams.get("adults") || "1");
    const children = Number(searchParams.get("children") || "0");
    const infants = Number(searchParams.get("infants") || "0");
    const travelClass = (searchParams.get("class") || "Economy").toUpperCase().replace(" ", "_");
    const tripType = searchParams.get("type") || "Round Trip";
    const nonStop = searchParams.get("nonStop") === "true" ? "true" : undefined;

    const origin = parseIata(originInput);
    const destination = parseIata(destinationInput);
    if (!origin || !destination || !departDate) {
      return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    const token = await getAccessToken();
    const baseUrl = getEnv("NEXT_PUBLIC_AMADEUS_BASE_URL", "https://test.travel.api.amadeus.com/");
    const searchUri = getEnv("NEXT_PUBLIC_AMADEUS_OFFER_SEARCH_URI", "v2/shopping/flight-offers");
    const url = new URL(searchUri, baseUrl);

    url.searchParams.set("originLocationCode", origin);
    url.searchParams.set("destinationLocationCode", destination);
    url.searchParams.set("departureDate", departDate);
    if (tripType !== "One Way" && returnDate) {
      url.searchParams.set("returnDate", returnDate);
    }
    url.searchParams.set("adults", String(adults));
    if (children > 0) url.searchParams.set("children", String(children));
    if (infants > 0) url.searchParams.set("infants", String(infants));
    url.searchParams.set("travelClass", travelClass); // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
    if (nonStop) url.searchParams.set("nonStop", nonStop);
    url.searchParams.set("currencyCode", "USD");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "amadeus_error", details: text }, { status: res.status });
    }

    const json = await res.json();
    const offers = mapOffers(json?.data || []);
    return NextResponse.json({ ok: true, offers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      segments?: Array<{ origin: string; destination: string; date: string }>;
      passengers?: { adults: number; children: number; infants: number };
      class?: string;
    };

    const segmentsIn = Array.isArray(body?.segments) ? body!.segments : [];
    const travelClass = String(body?.class || "Economy").toUpperCase().replace(" ", "_");
    const adults = Number(body?.passengers?.adults || 1);
    const children = Number(body?.passengers?.children || 0);
    const infants = Number(body?.passengers?.infants || 0);

    if (segmentsIn.length < 2) {
      return NextResponse.json({ ok: false, error: "invalid_segments" }, { status: 400 });
    }

    const originDestinations = segmentsIn.map((s, i) => {
      const dateStr = (s.date || "").trim();
      const hasTime = /T\d{2}:\d{2}/.test(dateStr);
      const depRange = hasTime ? { dateTime: dateStr } : { date: dateStr };
      return {
        id: String(i + 1),
        originLocationCode: parseIata(s.origin),
        destinationLocationCode: parseIata(s.destination),
        departureDateTimeRange: depRange,
      };
    });

    if (originDestinations.some(od => {
      const r: { date?: string; dateTime?: string } = (od as unknown as { departureDateTimeRange?: { date?: string; dateTime?: string } }).departureDateTimeRange || {};
      const hasDate = !!(r && (r.date || r.dateTime));
      return !od.originLocationCode || !od.destinationLocationCode || !hasDate;
    })) {
      return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    const travelers: Array<{ id: string; travelerType: "ADULT" | "CHILD" | "HELD_INFANT" }> = [];
    for (let i = 0; i < adults; i++) travelers.push({ id: String(travelers.length + 1), travelerType: "ADULT" });
    for (let i = 0; i < children; i++) travelers.push({ id: String(travelers.length + 1), travelerType: "CHILD" });
    for (let i = 0; i < infants; i++) travelers.push({ id: String(travelers.length + 1), travelerType: "HELD_INFANT" });

    const token = await getAccessToken();
    const baseUrl = getEnv("NEXT_PUBLIC_AMADEUS_BASE_URL", "https://test.travel.api.amadeus.com/");
    const searchUri = getEnv("NEXT_PUBLIC_AMADEUS_OFFER_SEARCH_URI", "v2/shopping/flight-offers");
    const url = new URL(searchUri, baseUrl).toString();

    const reqBody = {
      currencyCode: "USD",
      originDestinations,
      travelers,
      sources: ["GDS"],
      searchCriteria: {
        cabinRestrictions: [
          {
            cabin: travelClass,
            coverage: "MOST_SEGMENTS",
            originDestinationIds: originDestinations.map(od => od.id),
          },
        ],
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "amadeus_error", details: text }, { status: res.status });
    }

    const json = await res.json();
    const offers = mapOffers(json?.data || []);
    return NextResponse.json({ ok: true, offers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}
