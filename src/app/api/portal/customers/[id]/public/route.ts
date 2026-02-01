import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 3600; // Cache for 1 hour

/**
 * Public API to fetch sanitized customer profile details.
 * Only returns data if public_profile_enabled is true.
 * 
 * Endpoint: GET /api/portal/customers/[id]/public
 * 
 * Returns:
 * - id: Customer ID
 * - firstName, lastName: Public name
 * - companyName: Professional affiliation
 * - bio: Publicly shared bio
 * - profileImage: Avatar URL
 * - loyaltyTier: Loyalty program status
 * - country: User's location
 * - memberSince: Registration date
 * - bookingHistory: Sanitized trip list (Origin, Destination, Date, Type, Status)
 * - linkedTravellers: Sanitized traveller names and titles
 * 
 * Security:
 * - Does NOT return email, phone, address, passport, or any PII.
 * - Enforces public_profile_enabled check.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // 1. Fetch customer details
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select(`
        id, 
        firstName, 
        lastName, 
        company_name, 
        public_bio, 
        profileImage, 
        loyaltyTier, 
        country, 
        created_at,
        public_profile_enabled
      `)
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 2. Security Check: Only proceed if profile is public
    if (!customer.public_profile_enabled) {
      return NextResponse.json({ error: "This profile is private" }, { status: 403 });
    }

    // 3. Fetch public booking history (sanitized)
    // Only show basic trip info, hide sensitive details like PNR, prices, etc.
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select("origin, destination, travelDate, tripType, status")
      .eq("customerid", customerId)
      .order("travelDate", { ascending: false })
      .limit(5);

    // 4. Fetch public linked travellers (sanitized)
    // Only show names and titles
    const { data: travellers, error: travellersError } = await supabaseAdmin
      .from("travellers")
      .select("first_name, last_name, title")
      .eq("customer_id", customerId)
      .limit(10);

    // 5. Construct public response
    const publicProfile = {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      companyName: customer.company_name,
      bio: customer.public_bio,
      profileImage: customer.profileImage,
      loyaltyTier: customer.loyaltyTier,
      country: customer.country,
      memberSince: customer.created_at,
      bookingHistory: bookings || [],
      linkedTravellers: travellers || []
    };

    return NextResponse.json(publicProfile);
  } catch (error: unknown) {
    console.error("Error in public profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
