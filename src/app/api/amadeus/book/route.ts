import { NextResponse } from "next/server";
import { getAmadeus } from "@/lib/amadeusClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as {
      flightOffers: unknown[];
      travelers: unknown[];
      formOfPayments?: unknown;
      companyAttributes?: unknown;
    } | null;

    if (!body || !Array.isArray(body.travelers) || !Array.isArray(body.flightOffers)) {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const amadeus = getAmadeus();
    const response = await amadeus.client.post("/v1/booking/flight-orders", {
      data: {
        type: "flight-order",
        flightOffers: body.flightOffers,
        travelers: body.travelers,
        ...(body.formOfPayments ? { formOfPayments: body.formOfPayments } : {}),
        ...(body.companyAttributes ? (body.companyAttributes as any) : {}),
      },
    });

    return NextResponse.json({ ok: true, raw: response.result });
  } catch (err: unknown) {
    console.error("Amadeus Booking Error:", JSON.stringify(err, null, 2));

    // Extract Amadeus-specific error details
    let message = "Unknown error";
    let details = null;

    const errorObj = err as { response?: { body: string; statusCode: number; statusMessage: string }; message?: string };

    if (errorObj.response) {
      // Amadeus API error response
      try {
        const parsed = JSON.parse(errorObj.response.body);
        if (parsed.errors && Array.isArray(parsed.errors)) {
          message = parsed.errors.map((e: { title: string; detail: string }) => `${e.title}: ${e.detail}`).join(" | ");
          details = parsed.errors;
        }
      } catch {
        message = `API Error: ${errorObj.response.statusCode} ${errorObj.response.statusMessage}`;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({
      ok: false,
      error: "server_error",
      message,
      details
    }, { status: 500 });
  }
}

