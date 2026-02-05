import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { Airport, AirportDBRow, CreateAirportDTO } from "@/types/airport";

const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey || env.supabase.anonKey
);

/**
 * @swagger
 * /api/airports:
 *   get:
 *     summary: Retrieve a list of airports
 *     description: Retrieve a paginated list of airports with optional filtering and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, IATA code, or city
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by ISO country code
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, iata_code, country, city]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of airports
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sort_by") || "name";
    const order = searchParams.get("order") || "asc";

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("airports")
      .select("*", { count: "exact" });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,iata_code.ilike.%${search}%,municipality.ilike.%${search}%`);
    }

    if (country) {
      query = query.ilike("iso_country", country.trim());
    }

    if (city) {
      query = query.ilike("municipality", `%${city.trim()}%`);
    }

    if (status === 'active') {
      query = query.eq('published_status', true);
    } else if (status === 'inactive') {
      query = query.eq('published_status', false);
    }

    // Map frontend sort fields to DB fields
    const sortFieldMap: Record<string, string> = {
      name: "name",
      iata_code: "iata_code",
      country: "iso_country",
      city: "municipality",
    };

    const dbSortField = sortFieldMap[sortBy] || "name";
    
    // Get stats
    const { count: totalCount } = await supabaseAdmin.from("airports").select("*", { count: "exact", head: true });
    const { count: activeCount } = await supabaseAdmin.from("airports").select("*", { count: "exact", head: true }).eq("published_status", true);
    const { count: inactiveCount } = await supabaseAdmin.from("airports").select("*", { count: "exact", head: true }).eq("published_status", false);

    query = query.order(dbSortField, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // console.error("Error fetching airports:", error);
      return NextResponse.json(
        { error: "Failed to fetch airports" },
        { status: 500 }
      );
    }

    // Map DB rows to API model
    const airports: Airport[] = (data || []).map((row: AirportDBRow) => ({
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
      seo_title: row.seo_title || undefined,
      meta_description: row.meta_description || undefined,
      seo_image_url: row.seo_image_url || undefined,
      slug: row.slug || undefined,
      canonical_url: row.canonical_url || undefined,
      schema_markup: row.schema_markup || undefined,
      no_index: row.no_index ?? undefined,
      no_follow: row.no_follow ?? undefined,
      no_archive: row.no_archive ?? undefined,
      no_image_index: row.no_image_index ?? undefined,
      no_snippet: row.no_snippet ?? undefined,
    }));

    return NextResponse.json({
      data: airports,
      meta: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: inactiveCount || 0,
      }
    });
  } catch (error) {
    // console.error("Unexpected error in GET /api/airports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/airports:
 *   post:
 *     summary: Create a new airport
 *     description: Create a new airport record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - iata_code
 *               - name
 *               - city
 *               - country
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
 *       201:
 *         description: Airport created successfully
 *       400:
 *         description: Validation error or duplicate IATA code
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      iata_code, name, city, country, latitude, longitude, timezone, active,
      featured_image_url, description, fast_facts, top_airlines, gallery_urls, faqs, map_embed_code,
      seo_title, meta_description, seo_image_url, slug, canonical_url, schema_markup,
      no_index, no_follow, no_archive, no_image_index, no_snippet
    } = body as CreateAirportDTO;

    // Validation
    if (!iata_code || !name || !city || !country) {
      return NextResponse.json(
        { error: "Missing required fields: iata_code, name, city, country" },
        { status: 400 }
      );
    }

    if (iata_code.length !== 3) {
      return NextResponse.json(
        { error: "IATA code must be exactly 3 characters" },
        { status: 400 }
      );
    }

    // Check for duplicate IATA code
    const { data: existing } = await supabaseAdmin
      .from("airports")
      .select("id")
      .eq("iata_code", iata_code)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Airport with this IATA code already exists" },
        { status: 409 }
      );
    }

    // Insert new airport
    const { data, error } = await supabaseAdmin
      .from("airports")
      .insert({
        iata_code,
        name,
        municipality: city,
        iso_country: country,
        latitude_deg: latitude,
        longitude_deg: longitude,
        timezone: timezone,
        published_status: active !== undefined ? active : true, // Default to true if not provided
        featured_image_url,
        description,
        fast_facts,
        top_airlines,
        gallery_urls,
        faqs,
        map_embed_code,
        seo_title,
        meta_description,
        seo_image_url,
        slug,
        canonical_url,
        schema_markup,
        no_index,
        no_follow,
        no_archive,
        no_image_index,
        no_snippet,
      })
      .select()
      .single();

    if (error) {
      // console.error("Error creating airport:", error);
      return NextResponse.json(
        { error: "Failed to create airport" },
        { status: 500 }
      );
    }

    const newAirport: Airport = {
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
      seo_title: data.seo_title || undefined,
      meta_description: data.meta_description || undefined,
      seo_image_url: data.seo_image_url || undefined,
      slug: data.slug || undefined,
      canonical_url: data.canonical_url || undefined,
      schema_markup: data.schema_markup || undefined,
      no_index: data.no_index ?? undefined,
      no_follow: data.no_follow ?? undefined,
      no_archive: data.no_archive ?? undefined,
      no_image_index: data.no_image_index ?? undefined,
      no_snippet: data.no_snippet ?? undefined,
    };

    return NextResponse.json({ data: newAirport }, { status: 201 });
  } catch (error) {
    // console.error("Unexpected error in POST /api/airports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
