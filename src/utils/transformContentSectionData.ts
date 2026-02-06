
import { Route } from "@/types/route";

/**
 * Interface representing the raw row data structure extracted from the "Content Section" grid.
 */
export interface ContentSectionRow {
  section_title: string;
  main_description: string;
  best_time_to_visit: string;
  flight_duration_and_stopovers: string;
  // Basic route identifiers to map this content to a specific route
  departure_airport_code: string;
  arrival_airport_code: string;
}

/**
 * Validates and transforms raw content section data into a format suitable for Supabase insertion/update.
 * 
 * @param rows - Array of raw data objects
 * @returns Array of Partial<Route> objects ready for DB operations
 */
export function transformContentSectionData(rows: ContentSectionRow[]): Partial<Route>[] {
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
      content_section_title: cleanString(row.section_title),
      content_section_description: cleanString(row.main_description),
      content_section_best_time: cleanString(row.best_time_to_visit),
      content_section_duration_stopovers: cleanString(row.flight_duration_and_stopovers),
    };

    return routeUpdate;
  }).filter(item => Object.keys(item).length > 0);

  return transformedData;
}

/**
 * Example Usage / Seed Data
 */
export const exampleContentSectionData: ContentSectionRow[] = [
  {
    departure_airport_code: "SYD",
    arrival_airport_code: "KTM",
    section_title: "Cheap flights from Sydney to Kathmandu",
    main_description: "Booking your flights early is the best way to get cheap tickets...",
    best_time_to_visit: "The best time to visit Kathmandu is from September to November...",
    flight_duration_and_stopovers: "The average flight time is 14 hours with usually one stopover in Singapore or Kuala Lumpur.",
  }
];
