
import { FlightItinerary } from "@/types";

// Mock coordinates for "AI" calculations
// In a real app, this would come from a database or API
export const AIRPORT_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  KTM: { lat: 27.6966, lon: 85.3591, name: "Tribhuvan International" },
  DOH: { lat: 25.2609, lon: 51.5651, name: "Hamad International" },
  PER: { lat: -31.9385, lon: 115.9672, name: "Perth Airport" },
  LHR: { lat: 51.4700, lon: -0.4543, name: "Heathrow Airport" },
  JFK: { lat: 40.6413, lon: -73.7781, name: "John F. Kennedy International" },
  DXB: { lat: 25.2532, lon: 55.3657, name: "Dubai International" },
  SIN: { lat: 1.3644, lon: 103.9915, name: "Changi Airport" },
  SYD: { lat: -33.9399, lon: 151.1753, name: "Kingsford Smith" },
  HND: { lat: 35.5494, lon: 139.7798, name: "Haneda Airport" },
  CDG: { lat: 49.0097, lon: 2.5479, name: "Charles de Gaulle" },
  LAX: { lat: 33.9416, lon: -118.4085, name: "Los Angeles International" },
  SFO: { lat: 37.6213, lon: -122.3790, name: "San Francisco International" },
  AMS: { lat: 52.3105, lon: 4.7683, name: "Amsterdam Airport Schiphol" },
  FRA: { lat: 50.0379, lon: 8.5622, name: "Frankfurt Airport" },
  HKG: { lat: 22.3080, lon: 113.9185, name: "Hong Kong International" },
  BKK: { lat: 13.6900, lon: 100.7501, name: "Suvarnabhumi Airport" },
  IST: { lat: 41.2753, lon: 28.7519, name: "Istanbul Airport" },
  ICN: { lat: 37.4602, lon: 126.4407, name: "Incheon International" },
  KUL: { lat: 2.7456, lon: 101.7072, name: "Kuala Lumpur International" },
  DEL: { lat: 28.5562, lon: 77.1000, name: "Indira Gandhi International" },
  BOM: { lat: 19.0896, lon: 72.8656, name: "Chhatrapati Shivaji Maharaj International" },
  MEL: { lat: -37.6690, lon: 144.8410, name: "Melbourne Airport" },
  YYZ: { lat: 43.6777, lon: -79.6248, name: "Toronto Pearson International" },
  YVR: { lat: 49.1947, lon: -123.1792, name: "Vancouver International" },
  BCN: { lat: 41.2974, lon: 2.0833, name: "Josep Tarradellas Barcelona-El Prat" },
  MAD: { lat: 40.4839, lon: -3.5680, name: "Adolfo Suárez Madrid–Barajas" },
  FCO: { lat: 41.8003, lon: 12.2389, name: "Leonardo da Vinci–Fiumicino" },
  MUC: { lat: 48.3537, lon: 11.7750, name: "Munich Airport" },
  ZRH: { lat: 47.4582, lon: 8.5555, name: "Zurich Airport" },
  VIE: { lat: 48.1103, lon: 16.5697, name: "Vienna International" },
  ADL: { lat: -34.9461, lon: 138.5411, name: "Adelaide Airport" },
  CMB: { lat: 7.1802, lon: 79.8837, name: "Bandaranaike International" },
  HBA: { lat: -42.8364, lon: 147.5062, name: "Hobart International" },
  TFU: { lat: 30.3164, lon: 104.4442, name: "Chengdu Tianfu International" },
  MRL: { lat: -20.0667, lon: 145.583, name: "Miners Lake Airport" },
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: "miles" | "km" = "miles") => {
  const R = unit === "miles" ? 3958.8 : 6371; // Radius of Earth
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateItineraryMileage = (itineraries: FlightItinerary[] | undefined, unit: "miles" | "km" = "miles"): number => {
  if (!itineraries || !Array.isArray(itineraries)) return 0;

  let totalDistance = 0;

  itineraries.forEach((itinerary) => {
    if (!itinerary.segments) return;
    itinerary.segments.forEach((segment) => {
      const fromCode = segment.departure?.iataCode?.toUpperCase();
      const toCode = segment.arrival?.iataCode?.toUpperCase();
      
      if (!fromCode || !toCode) return;

      const fromCoords = AIRPORT_COORDINATES[fromCode];
      const toCoords = AIRPORT_COORDINATES[toCode];

      if (fromCoords && toCoords) {
        totalDistance += calculateDistance(
          fromCoords.lat,
          fromCoords.lon,
          toCoords.lat,
          toCoords.lon,
          unit
        );
      } else {
        // Fallback: Estimate distance if coordinates are missing?
        // For now, we'll just skip or add 0. 
        // In a real system we would have a complete DB or call an API.
        // Or we could add a default "average flight segment" distance like 500 miles if unknown?
        // Let's stick to 0 to be "precise" with what we know, 
        // but maybe we can improve AIRPORT_COORDINATES over time.
      }
    });
  });

  return totalDistance;
};
