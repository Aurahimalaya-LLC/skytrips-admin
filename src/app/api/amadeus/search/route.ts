import { NextResponse } from "next/server";

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

    const departureDateOnly = departDate.split("T")[0];
    const returnDateOnly = returnDate ? returnDate.split("T")[0] : "";
    const tripTypeApi = tripType === "One Way" ? "ONE_WAY" : "ROUND_TRIP";

    const originDestinations: Array<{
      id: string;
      originLocationCode: string;
      destinationLocationCode: string;
      departureDateTimeRange: { date: string };
    }> = [
      {
        id: "1",
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDateTimeRange: { date: departureDateOnly },
      },
    ];

    if (tripType !== "One Way" && returnDateOnly) {
      originDestinations.push({
        id: "2",
        originLocationCode: destination,
        destinationLocationCode: origin,
        departureDateTimeRange: { date: returnDateOnly },
      });
    }

    const baseUrl = getEnv("NEXT_PUBLIC_API_BASE_URL", "https://dev-api.skytrips.com.au/");
    const path = "flight-search/family-tree/price-group";
    const url = new URL(path, baseUrl).toString();
    const clientRef = getEnv("NEXT_PUBLIC_SKYTRIPS_CLIENT_REF", "1223");

    const reqBody = {
      originDestinations,
      adults,
      children,
      infants,
      travelClass,
      currencyCode: "AUD",
      tripType: tripTypeApi,
      manualSort: "PRICE_LOW_TO_HIGH",
      groupByPrice: true,
      origin,
      destination,
      departureDate: departureDateOnly,
      ...(returnDateOnly ? { returnDate: returnDateOnly } : {}),
      nonStop: nonStop === "true",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ama-client-ref": clientRef,
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "skytrips_error", details: text }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({ ok: true, raw: json });
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
    const firstSegment = segmentsIn[0];
    const lastSegment = segmentsIn[segmentsIn.length - 1];
    const origin = parseIata(firstSegment.origin);
    const destination = parseIata(lastSegment.destination);
    const departureDate = (firstSegment.date || "").split("T")[0];
    const returnDate = (lastSegment.date || "").split("T")[0];

    const baseUrl = getEnv("NEXT_PUBLIC_SKYTRIPS_API_BASE", "https://dev-api.skytrips.com.au/");
    const path = "flight-search/family-tree/price-group";
    const url = new URL(path, baseUrl).toString();
    const clientRef = getEnv("NEXT_PUBLIC_SKYTRIPS_CLIENT_REF", "1223");

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

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ama-client-ref": clientRef,
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "skytrips_error", details: text }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({ ok: true, raw: json });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}
