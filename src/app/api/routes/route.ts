import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { routeSchema } from "../../../lib/schemas/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validate with Zod
    const validation = routeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validation.error.format() },
        { status: 400 }
      );
    }

    // 2. Prepare payload
    // We need to remove legacy fields that might be present in the body but not in the schema
    // Specifically, remove top-level SEO and Content Section fields
    const { 
      seo_title, 
      meta_description, 
      canonical_url, 
      schema_markup, 
      robots_meta,
      content_section_title,
      content_section_description,
      content_section_best_time,
      content_section_duration_stopovers,
      description, // Also remove legacy top-level description if it's causing issues
      ...cleanBody 
    } = body;

    // Ensure slug is generated if not provided
    const payload = { ...cleanBody };
    // If description is needed and part of the schema, add it back to payload if it exists
    // But since the error says "Could not find the 'description' column", we should omit it for now
    // or map it to a new field if intended. 
    // Assuming 'description' was a legacy field or part of 'route_info' / 'content_sections'.
    
    if (!payload.slug && payload.departure_airport && payload.arrival_airport) {
      payload.slug = `flights-from-${payload.departure_airport}-to-${payload.arrival_airport}`.toLowerCase();
    }

    // 3. Insert into Database
    // Note: The supabase client will throw an error if we try to insert columns that don't exist
    // The cleanBody above should handle most cases, but if there are other legacy fields
    // they should be removed as well.
    const { data, error } = await supabase
      .from("routes")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const departure = searchParams.get("departure");
  const arrival = searchParams.get("arrival");
  
  let query = supabase.from("routes").select("*");
  
  if (departure) {
    query = query.eq("departure_airport", departure);
  }
  
  if (arrival) {
    query = query.eq("arrival_airport", arrival);
  }

  // Default sort by created_at desc
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
