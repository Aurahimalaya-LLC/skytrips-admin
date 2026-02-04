import { NextResponse } from "next/server";
import { getAmadeus } from "@/lib/amadeusClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as any;
    if (!body) {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }
    const flightOffer = body.flightOffer || body;

    const amadeus = getAmadeus();

    try {
      // FIX: The Amadeus Node SDK forces "X-HTTP-Method-Override: GET" on this endpoint, 
      // which the Enterprise API strictly rejects (404). 
      // Appending query params fails strict validation (400).
      // SOLUTION: We manually fetch the token from the SDK and use native fetch 
      // to send a clean POST request without the problematic header.

      // 1. Get the Access Token reusing SDK's logic handling expiry/refresh
      const token = await amadeus.client.accessToken.bearerToken(amadeus.client);

      // 2. Construct URL
      const baseUrl = process.env.AMADEUS_BASE_URL?.replace(/\/+$/, '') || 'https://travel.api.amadeus.com';
      const url = `${baseUrl}/v1/shopping/flight-offers/pricing`;

      // 3. Make direct fetch request
      const rawResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/vnd.amadeus+json",
          "Accept": "application/json, application/vnd.amadeus+json"
        },
        body: JSON.stringify({
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flightOffer],
            additionalInformation: { fareRules: true },
          },
        })
      });

      const json = await rawResponse.json();

      if (!rawResponse.ok) {
        // manually construct error object to match previous catch block structure
        throw {
          response: {
            statusCode: rawResponse.status,
            body: JSON.stringify(json)
          }
        };
      }

      return NextResponse.json({ ok: true, raw: json });

    } catch (amadeusError: any) {
      console.error("Amadeus Pricing Error:", JSON.stringify(amadeusError, null, 2));

      let message = "Unknown error";
      let details = null;
      let statusCode = 500;

      if (amadeusError?.response) {
        statusCode = amadeusError.response.statusCode || 500;
        try {
          const parsed = JSON.parse(amadeusError.response.body);
          if (parsed.errors && Array.isArray(parsed.errors)) {
            message = parsed.errors.map((e: { title: string; detail: string }) => `${e.title}: ${e.detail}`).join(" | ");
            details = parsed.errors;
          } else if (parsed.error_description) {
            message = parsed.error_description;
          } else if (parsed.title) {
            message = parsed.title;
          }
        } catch {
          message = `API Error: ${amadeusError.response.statusCode}`;
        }
      } else if (amadeusError instanceof Error) {
        message = amadeusError.message;
      }

      return NextResponse.json({
        ok: false,
        error: "amadeus_error",
        message,
        details
      }, { status: statusCode });
    }

  } catch (err: unknown) {
    console.error("Server Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}

