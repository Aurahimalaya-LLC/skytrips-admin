
import { describe, it, expect, vi } from 'vitest';
import { transformRouteInfoData, RouteInfoRow } from './transformRouteInfoData';

describe('transformRouteInfoData', () => {
  it('should transform valid route info data correctly', () => {
    const input: RouteInfoRow[] = [
      {
        departure_airport_code: "syd",
        arrival_airport_code: "ktm",
        average_flight_time: "  14h 30m  ",
        distance: "10,500 km",
        cheapest_months: "February, March",
        daily_flights: "3",
      }
    ];

    const result = transformRouteInfoData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      departure_airport: "SYD",
      arrival_airport: "KTM",
      average_flight_time: "14h 30m",
      distance: "10,500 km",
      cheapest_month: "February, March",
      daily_flights: 3,
    });
  });

  it('should handle missing identifier fields by skipping the row', () => {
    const input: RouteInfoRow[] = [
      {
        departure_airport_code: "",
        arrival_airport_code: "KTM",
        average_flight_time: "14h",
        distance: "",
        cheapest_months: "",
        daily_flights: 1,
      }
    ];

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = transformRouteInfoData(input);
    
    expect(result).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle invalid numbers gracefully', () => {
    const input: RouteInfoRow[] = [
      {
        departure_airport_code: "SYD",
        arrival_airport_code: "KTM",
        average_flight_time: "14h",
        distance: "",
        cheapest_months: "",
        daily_flights: "invalid", // Should become undefined
      }
    ];

    const result = transformRouteInfoData(input);
    
    expect(result[0].daily_flights).toBeUndefined();
  });

  it('should handle empty input array', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = transformRouteInfoData([]);
    
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
