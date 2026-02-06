
import { Route } from "@/types/route";

/**
 * Interface representing the raw row data structure extracted from the "Things to Note" table/grid.
 * This corresponds to the form fields found in the HTML structure.
 */
export interface ThingsToNoteRow {
  origin_airport_note: string;
  time_difference_note: string;
  currency_note: string;
  power_plugs_note: string;
  // Basic route identifiers to map this note to a specific route
  departure_airport_code: string; 
  arrival_airport_code: string;
}

/**
 * Validates and transforms raw table data into a format suitable for Supabase insertion/update.
 * 
 * @param rows - Array of raw data objects
 * @returns Array of Partial<Route> objects ready for DB operations
 */
export function transformThingsToNoteData(rows: ThingsToNoteRow[]): Partial<Route>[] {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("No data provided for transformation.");
    return [];
  }

  const transformedData: Partial<Route>[] = rows.map((row, index) => {
    // 1. Validation & Error Handling
    if (!row.departure_airport_code || !row.arrival_airport_code) {
      console.error(`Row ${index + 1}: Missing required airport codes for mapping.`);
      return {}; // Return empty object or throw error based on strictness requirement
    }

    // 2. Data Cleaning & Type Safety
    // Ensure all note fields are strings and trim whitespace
    const cleanString = (val: any): string => {
      if (typeof val === 'string') return val.trim();
      if (val === null || val === undefined) return '';
      return String(val);
    };

    // 3. Object Construction
    // Mapping raw column names to Supabase 'routes' table columns
    const routeUpdate: Partial<Route> = {
      // Identifiers (used for matching, not necessarily updating if using upsert with conflict)
      departure_airport: cleanString(row.departure_airport_code).toUpperCase(),
      arrival_airport: cleanString(row.arrival_airport_code).toUpperCase(),

      // Mapped Columns
      things_to_note_origin_airport: cleanString(row.origin_airport_note),
      things_to_note_time_diff: cleanString(row.time_difference_note),
      things_to_note_currency: cleanString(row.currency_note),
      things_to_note_power_plugs: cleanString(row.power_plugs_note),
    };

    return routeUpdate;
  }).filter(item => Object.keys(item).length > 0); // Remove invalid entries

  return transformedData;
}

/**
 * Example Usage / Seed Data
 * This demonstrates how the data from the div structure would be represented.
 */
export const exampleThingsToNoteData: ThingsToNoteRow[] = [
  {
    departure_airport_code: "SYD",
    arrival_airport_code: "KTM",
    origin_airport_note: "Arrive at least 3 hours before departure for international flights.",
    time_difference_note: "Kathmandu is 5 hours and 15 minutes behind Sydney.",
    currency_note: "Nepalese Rupee (NPR). 1 AUD ≈ 88 NPR.",
    power_plugs_note: "Type C, D and M. 230V, 50Hz. Bring a universal adapter.",
  },
  {
    departure_airport_code: "MEL",
    arrival_airport_code: "LHR",
    origin_airport_note: "Melbourne Airport can be busy; check security wait times online.",
    time_difference_note: "London is 11 hours behind Melbourne.",
    currency_note: "British Pound (GBP). Contactless payment is widely accepted.",
    power_plugs_note: "Type G. 230V. Standard UK 3-pin plug.",
  }
];

/*
 * Supabase Insertion Example:
 * 
 * import { supabase } from "@/lib/supabase";
 * 
 * async function batchUpdateRoutes() {
 *   const payload = transformThingsToNoteData(exampleThingsToNoteData);
 *   
 *   for (const routeData of payload) {
 *     // We need to find the specific route ID to update it, as 'departure' + 'arrival' might not be unique
 *     // This logic assumes we want to update existing routes.
 *     
 *     const { error } = await supabase
 *       .from('routes')
 *       .update({
 *         things_to_note_origin_airport: routeData.things_to_note_origin_airport,
 *         things_to_note_time_diff: routeData.things_to_note_time_diff,
 *         things_to_note_currency: routeData.things_to_note_currency,
 *         things_to_note_power_plugs: routeData.things_to_note_power_plugs,
 *       })
 *       .match({ 
 *         departure_airport: routeData.departure_airport, 
 *         arrival_airport: routeData.arrival_airport 
 *       });
 *       
 *     if (error) console.error('Error updating:', error);
 *   }
 * }
 */
