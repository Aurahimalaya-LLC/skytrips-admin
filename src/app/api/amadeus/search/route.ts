import { NextResponse } from "next/server";
import { getAmadeus } from "@/lib/amadeusClient";

export const runtime = "nodejs";

function parseIata(input?: string): string {
  if (!input) return "";
  
  // Decode and trim just in case
  let clean = input;
  try {
    clean = decodeURIComponent(input).trim();
  } catch {
    clean = input.trim();
  }

  // 1. Look for 3 uppercase letters inside parentheses, e.g. "Name (KTM)"
  const match = clean.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];

  // 2. Check if the string itself is a 3-letter code (e.g. "KTM")
  if (/^[A-Z]{3}$/.test(clean)) return clean;

  // 3. Last resort: simple regex for ends with (XXX)
  const endMatch = clean.match(/\(([^)]+)\)\s*$/);
  if (endMatch) return endMatch[1].trim();

  return clean;
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
    const travelClass = (searchParams.get("class") || "Economy").toUpperCase().replace(/\s+/g, "_");
    const tripType = searchParams.get("type") || "Round Trip";
    const nonStop = searchParams.get("nonStop") === "true" ? "true" : undefined;

    const origin = parseIata(originInput);
    const destination = parseIata(destinationInput);
    if (!origin || !destination || !departDate) {
      return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
    }

    const departureDateOnly = departDate.split("T")[0];
    const returnDateOnly = returnDate ? returnDate.split("T")[0] : "";

    const amadeus = getAmadeus();
    
    // Construct parameters for GET request (amadeus.shopping.flightOffersSearch.get)
    const params: {
      originLocationCode: string;
      destinationLocationCode: string;
      departureDate: string;
      adults: number;
      children?: number;
      infants?: number;
      travelClass?: string;
      currencyCode: string;
      nonStop?: boolean;
      max: number;
      returnDate?: string;
    } = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDateOnly,
      adults,
      children: children > 0 ? children : undefined,
      infants: infants > 0 ? infants : undefined,
      travelClass: travelClass === "ANY" ? undefined : travelClass,
      currencyCode: "AUD",
      nonStop: nonStop === "true",
      max: 50 // Limit results for performance
    };

    if (returnDateOnly && tripType !== "One Way") {
      params.returnDate = returnDateOnly;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(params);
    return NextResponse.json({ ok: true, raw: response.result });
  } catch (err: unknown) {
    console.error("Amadeus Search Error:", err);
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
    const firstSegment = segmentsIn[0];
    const lastSegment = segmentsIn[segmentsIn.length - 1];
    const origin = parseIata(firstSegment.origin);
    const destination = parseIata(lastSegment.destination);
    const departureDate = (firstSegment.date || "").split("T")[0];
    const returnDate = (lastSegment.date || "").split("T")[0];

    const reqBody = {
      originDestinations,
      adults,
      children,
      infants,
      travelClass,
      currencyCode: "AUD",
      tripType: "ONE_WAY",
      manualSort: "PRICE_LOW_TO_HIGH",
      groupByPrice: true,
      origin,
      destination,
      departureDate,
      returnDate,
    };

    const amadeus = getAmadeus();
    const response = await amadeus.client.post("/v2/shopping/flight-offers", {
      data: reqBody,
    });
    return NextResponse.json({ ok: true, raw: response.result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}
