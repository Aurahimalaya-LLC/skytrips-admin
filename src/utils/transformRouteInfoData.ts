
import { Route } from "@/types/route";

/**
 * Interface representing the raw row data structure extracted from the "Route Information" section.
 */
export interface RouteInfoRow {
  average_flight_time: string;
  distance: string;
  cheapest_months: string; // Comma-separated string from the UI
  daily_flights: number | string;
  // Basic route identifiers to map this info to a specific route
  departure_airport_code: string;
  arrival_airport_code: string;
}

/**
 * Validates and transforms raw route information data into a format suitable for Supabase insertion/update.
 * 
 * @param rows - Array of raw data objects
 * @returns Array of Partial<Route> objects ready for DB operations
 */
export function transformRouteInfoData(rows: RouteInfoRow[]): Partial<Route>[] {
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

    const cleanNumber = (val: any): number | undefined => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string' && val.trim() !== '') {
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // 3. Object Construction
    // Mapping raw column names to Supabase 'routes' table columns
    const routeUpdate: Partial<Route> = {
      // Identifiers
      departure_airport: cleanString(row.departure_airport_code).toUpperCase(),
      arrival_airport: cleanString(row.arrival_airport_code).toUpperCase(),

      // Mapped Columns
      average_flight_time: cleanString(row.average_flight_time),
      distance: cleanString(row.distance),
      cheapest_month: cleanString(row.cheapest_months),
      daily_flights: cleanNumber(row.daily_flights),
    };

    return routeUpdate;
  }).filter(item => Object.keys(item).length > 0);

  return transformedData;
}

/**
 * Example Usage / Seed Data
 */
export const exampleRouteInfoData: RouteInfoRow[] = [
  {
    departure_airport_code: "SYD",
    arrival_airport_code: "KTM",
    average_flight_time: "14h 30m",
    distance: "10,500 km",
    cheapest_months: "February, March, August",
    daily_flights: 3,
  }
];
