
import { Route } from "@/types/route";

/**
 * Interface representing the raw row data structure extracted from the "SEO Settings" section.
 */
export interface SEOSettingsRow {
  seo_title: string;
  meta_description: string;
  slug: string;
  canonical_url: string;
  schema_markup: string;
  robots_meta_no_index: boolean;
  robots_meta_no_follow: boolean;
  robots_meta_no_archive: boolean;
  robots_meta_no_image_index: boolean;
  robots_meta_no_snippet: boolean;
  // Basic route identifiers to map this SEO data to a specific route
  departure_airport_code: string;
  arrival_airport_code: string;
}

/**
 * Validates and transforms raw SEO settings data into a format suitable for Supabase insertion/update.
 * 
 * @param rows - Array of raw data objects
 * @returns Array of Partial<Route> objects ready for DB operations
 */
export function transformSEOSettingsData(rows: SEOSettingsRow[]): Partial<Route>[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("No data provided for transformation.");
    return [];
  }

  const transformedData: Partial<Route>[] = rows.map((row, index) => {
    // 1. Validation & Error Handling
    if (!row.departure_airport_code || !row.arrival_airport_code) {
      console.error(`Row ${index + 1}: Missing required airport codes for mapping.`);
      return {};
    }

    // 2. Data Cleaning & Type Safety
    const cleanString = (val: any): string => {
      if (typeof val === 'string') return val.trim();
      if (val === null || val === undefined) return '';
      return String(val);
    };

    // 3. Object Construction
    // Mapping raw column names to Supabase 'routes' table columns
    const routeUpdate: Partial<Route> = {
      // Identifiers
      departure_airport: cleanString(row.departure_airport_code).toUpperCase(),
      arrival_airport: cleanString(row.arrival_airport_code).toUpperCase(),

      // Mapped Columns
      seo_title: cleanString(row.seo_title),
      meta_description: cleanString(row.meta_description),
      slug: cleanString(row.slug),
      canonical_url: cleanString(row.canonical_url),
      schema_markup: cleanString(row.schema_markup),
      robots_meta: {
        no_index: !!row.robots_meta_no_index,
        no_follow: !!row.robots_meta_no_follow,
        no_archive: !!row.robots_meta_no_archive,
        no_image_index: !!row.robots_meta_no_image_index,
        no_snippet: !!row.robots_meta_no_snippet,
      },
    };

    return routeUpdate;
  }).filter(item => Object.keys(item).length > 0);

  return transformedData;
}

/**
 * Example Usage / Seed Data
 */
export const exampleSEOSettingsData: SEOSettingsRow[] = [
  {
    departure_airport_code: "SYD",
    arrival_airport_code: "KTM",
    seo_title: "Cheap Flights from Sydney to Kathmandu | SkyTrips",
    meta_description: "Find the best deals on flights from Sydney (SYD) to Kathmandu (KTM). Compare airlines, prices, and schedules to book your trip today.",
    slug: "flights-sydney-to-kathmandu",
    canonical_url: "https://skytrips.com.au/flights/sydney-to-kathmandu",
    schema_markup: '{"@context": "https://schema.org", "@type": "Flight", ...}',
    robots_meta_no_index: false,
    robots_meta_no_follow: false,
    robots_meta_no_archive: false,
    robots_meta_no_image_index: false,
    robots_meta_no_snippet: false,
  }
];
