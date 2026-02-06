import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { routeSchema } from "../../../../lib/schemas/route";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // 1. Validate with Zod
    // We use partial because PATCH might only update some fields
    // However, for route_info, if provided, we should validate it against the schema
    // Since our routeSchema uses optional() for route_info, we need to be careful.
    
    // Let's manually validate route_info if it exists in the body
    if (body.route_info) {
       const result = routeSchema.shape.route_info.safeParse(body.route_info);
       if (!result.success) {
         return NextResponse.json(
           { error: "Validation Error", details: result.error.format() },
           { status: 400 }
         );
       }
    }

    // Validate seo_settings if present
    if (body.seo_settings) {
       const result = routeSchema.shape.seo_settings.safeParse(body.seo_settings);
       if (!result.success) {
         return NextResponse.json(
           { error: "SEO Validation Error", details: result.error.format() },
           { status: 400 }
         );
       }
    }

    // 2. Update Database
    const { data, error } = await supabase
      .from("routes")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
