import { NextResponse } from "next/server";
import { getAmadeus } from "@/lib/amadeusClient";
import { getAdminClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let requestBody: any = null;
  
  try {
    requestBody = await req.json().catch(() => null);

    if (!requestBody || !Array.isArray(requestBody.travelers) || !Array.isArray(requestBody.flightOffers)) {
      return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const amadeus = getAmadeus();
    
    // Call Amadeus
    let response;
    let amadeusError = null;

    try {
      response = await amadeus.client.post("/v1/booking/flight-orders", {
        data: {
          type: "flight-order",
          flightOffers: requestBody.flightOffers,
          travelers: requestBody.travelers,
          ...(requestBody.formOfPayments ? { formOfPayments: requestBody.formOfPayments } : {}),
          ...(requestBody.companyAttributes ? (requestBody.companyAttributes as any) : {}),
        },
      });
    } catch (err: any) {
      amadeusError = err;
    }

    const supabase = getAdminClient();
    let bookingIdToReturn: string | null = null;

    if (!amadeusError && response && supabase) {
      // Success case
      const order = response.result.data;
      
      let bookingError = null;
      try {
        const flightOffer = order.flightOffers?.[0] as any;
        const itinerary = flightOffer?.itineraries?.[0];
        const firstSegment = itinerary?.segments?.[0];
        const lastSegment = itinerary?.segments?.[itinerary.segments.length - 1];
        
        const price = order.price?.grandTotal || order.price?.total;
        const currency = order.price?.billingCurrency || order.price?.currency;

        // Extract 6-char PNR from associatedRecords (usually GDS PNR)
        const pnrRecord = order.associatedRecords?.find((r: any) => r.originSystemCode === "GDS");
        const pnr = pnrRecord?.reference || order.associatedRecords?.[0]?.reference;
        
        // Extract Airline Name
        const validatingAirlineCode = flightOffer?.validatingAirlineCodes?.[0];
        let airlineName = validatingAirlineCode;
        if (response.result?.dictionaries?.carriers && validatingAirlineCode) {
             airlineName = response.result.dictionaries.carriers[validatingAirlineCode] || validatingAirlineCode;
        }

        // Extract Transit Info
        const segments = itinerary?.segments || [];
        const transitAirports: string[] = [];
        if (segments.length > 1) {
             for (let i = 0; i < segments.length - 1; i++) {
                 transitAirports.push(segments[i].arrival.iataCode);
             }
        }
        const transitString = transitAirports.length > 0 ? transitAirports.join(", ") : null;

        // Use requestBody.travelers as it's definitely present
        const travelersData = requestBody.travelers || order.travelers;

        // Calculate Date Fields
        const now = new Date();
        const issueMonth = now.toLocaleString('default', { month: 'long' }); // e.g., "January"
        const issueDay = String(now.getDate()); // e.g., "30"
        const issueYear = String(now.getFullYear()); // e.g., "2026"

        // Determine Trip Type for DB
        const isRoundTrip = requestBody.flightOffers[0].itineraries.length > 1;
        const tripType = isRoundTrip ? "Round Trip" : "One Way";
        
        // Insert into bookings table
        const { data: bookingData, error } = await supabase
          .from("bookings")
          .insert({
            pnr: pnr, // The 6-char PNR
            booking_reference: order.id, // Amadeus Order ID
            status: "ON_HOLD",
            total_price: price,
            currency: currency,
            flight_data: order,
            origin: firstSegment?.departure?.iataCode,
            destination: lastSegment?.arrival?.iataCode,
            travel_date: firstSegment?.departure?.at,
            user_id: null, // We don't have user context easily here without headers/auth check
            contact_details: {
              ...order.travelers?.[0]?.contact,
              name: order.travelers?.[0]?.name
            },
            tripType: tripType, // camelCase column name as per DB
            issueMonth: issueMonth,
            IssueDay: issueDay, // Capital 'I' as per DB
            issueYear: issueYear,
            airlines: airlineName,
            transit: transitString,
            travellers: travelersData,
          })
          .select()
          .single();
        
        bookingError = error;

        if (bookingError) {
          console.error("Failed to save booking to Supabase:", bookingError);
        } else if (bookingData) {
          bookingIdToReturn = bookingData.id;
          
          // Log to booking_logs
          await supabase.from("booking_logs").insert({
            booking_id: bookingData.id,
            type: "AMADEUS_BOOKING",
            request_payload: requestBody,
            response_payload: response.result,
            status: "SUCCESS"
          });

          // Log activity
          await supabase.from("booking_activities").insert({
            booking_id: bookingData.id,
            action: "BOOKING_CREATED",
            details: {
              pnr: order.id,
              price,
              origin: firstSegment?.departure?.iataCode,
              destination: lastSegment?.arrival?.iataCode,
              travelersCount: requestBody.travelers.length
            }
          });
        }
      } catch (saveError) {
        console.error("Error saving booking details:", saveError);
        bookingError = saveError as any;
      }

      return NextResponse.json({ 
        ok: true, 
        raw: response.result,
        bookingId: bookingIdToReturn,
        dbError: bookingError ? JSON.stringify(bookingError) : null
      });

    } else {
      // Error case
      const errorDetails = amadeusError?.response?.body ? JSON.parse(amadeusError.response.body) : amadeusError;
      
      if (supabase) {
        // Log failed attempt
        await supabase.from("booking_logs").insert({
          booking_id: null,
          type: "AMADEUS_BOOKING",
          request_payload: requestBody,
          response_payload: null,
          error_details: errorDetails,
          status: "ERROR"
        });
      }

      console.error("Amadeus Booking Error:", JSON.stringify(amadeusError, null, 2));

      // Format error message for frontend
      let message = "Unknown error";
      let details = null;
      
      if (amadeusError?.response) {
        try {
          const parsed = JSON.parse(amadeusError.response.body);
          if (parsed.errors && Array.isArray(parsed.errors)) {
            message = parsed.errors.map((e: { title: string; detail: string }) => `${e.title}: ${e.detail}`).join(" | ");
            details = parsed.errors;
          }
        } catch {
          message = `API Error: ${amadeusError.response.statusCode} ${amadeusError.response.statusMessage}`;
        }
      } else if (amadeusError instanceof Error) {
        message = amadeusError.message;
      }

      return NextResponse.json({
        ok: false,
        error: "server_error",
        message,
        details
      }, { status: 500 });
    }

  } catch (err: unknown) {
    console.error("Server Error:", err);
    return NextResponse.json({
      ok: false,
      error: "server_error",
      message: err instanceof Error ? err.message : "Internal Server Error"
    }, { status: 500 });
  }
}
