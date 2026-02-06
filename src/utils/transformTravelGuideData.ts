
import { Route } from "@/types/route";

/**
 * Interface representing the raw row data structure extracted from the "Travel Guide" section.
 */
export interface TravelGuideRow {
  heading: string;
  description: string;
  image_url: string;
  tags: string[];
  places_of_interest: string;
  getting_around: string;
  // Basic route identifiers to map this guide to a specific route
  departure_airport_code: string;
  arrival_airport_code: string;
}

/**
 * Validates and transforms raw travel guide data into a format suitable for Supabase insertion/update.
 * 
 * @param rows - Array of raw data objects
 * @returns Array of Partial<Route> objects ready for DB operations
 */
export function transformTravelGuideData(rows: TravelGuideRow[]): Partial<Route>[] {
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

    const cleanTags = (tags: any): string[] => {
      if (Array.isArray(tags)) {
        return tags.map(tag => cleanString(tag)).filter(tag => tag !== '');
      }
      return [];
    };

    // 3. Object Construction
    // Mapping raw column names to Supabase 'routes' table columns
    const routeUpdate: Partial<Route> = {
      // Identifiers
      departure_airport: cleanString(row.departure_airport_code).toUpperCase(),
      arrival_airport: cleanString(row.arrival_airport_code).toUpperCase(),

      // Mapped Columns
      travel_guide_heading: cleanString(row.heading),
      travel_guide_description: cleanString(row.description),
      travel_guide_image: cleanString(row.image_url),
      travel_guide_tags: cleanTags(row.tags),
      travel_guide_places: cleanString(row.places_of_interest),
      travel_guide_getting_around: cleanString(row.getting_around),
    };

    return routeUpdate;
  }).filter(item => Object.keys(item).length > 0);

  return transformedData;
}

/**
 * Example Usage / Seed Data
 */
export const exampleTravelGuideData: TravelGuideRow[] = [
  {
    departure_airport_code: "SYD",
    arrival_airport_code: "KTM",
    heading: "Discover Kathmandu",
    description: "Kathmandu, the capital of Nepal, is a vibrant city steeped in history and culture...",
    image_url: "https://example.com/ktm-cover.jpg",
    tags: ["History", "Culture", "Nature"],
    places_of_interest: "Swayambhunath, Pashupatinath Temple, Boudhanath Stupa",
    getting_around: "Taxis are cheap and readily available. Ride-sharing apps like Pathao are popular.",
  }
];
