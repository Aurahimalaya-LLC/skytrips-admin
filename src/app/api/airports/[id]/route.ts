import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Airport, AirportDBRow, UpdateAirportDTO } from "@/types/airport";

/**
 * @swagger
 * /api/airports/{id}:
 *   get:
 *     summary: Get airport by ID
 *     description: Retrieve details of a specific airport.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Airport details
 *       404:
 *         description: Airport not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("airports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Airport not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching airport:", error);
      return NextResponse.json(
        { error: "Failed to fetch airport" },
        { status: 500 }
      );
    }

    const row = data as AirportDBRow;
    const airport: Airport = {
      id: row.id,
      iata_code: row.iata_code,
      name: row.name,
      city: row.municipality || "",
      country: row.iso_country || "",
      latitude: row.latitude_deg || null,
      longitude: row.longitude_deg || null,
      timezone: row.timezone || null,
      active: row.published_status ?? false,
      featured_image_url: row.featured_image_url,
      description: row.description,
      fast_facts: row.fast_facts,
      top_airlines: row.top_airlines,
      gallery_urls: row.gallery_urls,
      faqs: row.faqs,
      map_embed_code: row.map_embed_code,
    };

    return NextResponse.json({ data: airport });
  } catch (error) {
    console.error("Unexpected error in GET /api/airports/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/airports/{id}:
 *   put:
 *     summary: Update airport
 *     description: Update an existing airport record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               iata_code:
 *                 type: string
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Airport updated successfully
 *       404:
 *         description: Airport not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      iata_code, name, city, country, latitude, longitude, timezone, active,
      featured_image_url, description, fast_facts, top_airlines, gallery_urls, faqs, map_embed_code
    } = body as UpdateAirportDTO & { active?: boolean };

    // Build update object
    const updateData: Partial<AirportDBRow> = {};
    if (iata_code) updateData.iata_code = iata_code;
    if (name) updateData.name = name;
    if (city) updateData.municipality = city;
    if (country) updateData.iso_country = country;
    if (latitude !== undefined) updateData.latitude_deg = latitude;
    if (longitude !== undefined) updateData.longitude_deg = longitude;
    if (timezone) updateData.timezone = timezone;
    if (active !== undefined) updateData.published_status = active;
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
    if (description !== undefined) updateData.description = description;
    if (fast_facts !== undefined) updateData.fast_facts = fast_facts;
    if (top_airlines !== undefined) updateData.top_airlines = top_airlines;
    if (gallery_urls !== undefined) updateData.gallery_urls = gallery_urls;
    if (faqs !== undefined) updateData.faqs = faqs;
    if (map_embed_code !== undefined) updateData.map_embed_code = map_embed_code;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("airports")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Airport not found" },
          { status: 404 }
        );
      }
      console.error("Error updating airport:", error);
      return NextResponse.json(
        { error: "Failed to update airport" },
        { status: 500 }
      );
    }

    const updatedAirport: Airport = {
      id: data.id,
      iata_code: data.iata_code,
      name: data.name,
      city: data.municipality || "",
      country: data.iso_country || "",
      latitude: data.latitude_deg || null,
      longitude: data.longitude_deg || null,
      timezone: data.timezone || null,
      active: data.published_status ?? false,
      featured_image_url: data.featured_image_url,
      description: data.description,
      fast_facts: data.fast_facts,
      top_airlines: data.top_airlines,
      gallery_urls: data.gallery_urls,
      faqs: data.faqs,
      map_embed_code: data.map_embed_code,
    };

    return NextResponse.json({ data: updatedAirport });
  } catch (error) {
    console.error("Unexpected error in PUT /api/airports/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/airports/{id}:
 *   delete:
 *     summary: Delete airport
 *     description: Delete an airport record.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Airport deleted successfully
 *       404:
 *         description: Airport not found
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("airports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting airport:", error);
      return NextResponse.json(
        { error: "Failed to delete airport" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Airport deleted successfully" });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/airports/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
