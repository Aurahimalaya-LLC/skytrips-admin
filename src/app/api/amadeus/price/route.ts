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
    const response = await amadeus.client.post("/v1/shopping/flight-offers/pricing", {
      data: {
        type: "flight-offers-pricing",
        flightOffers: [flightOffer],
        additionalInformation: { fareRules: true },
      },
    });

    return NextResponse.json({ ok: true, raw: response.result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: "server_error", message }, { status: 500 });
  }
}

