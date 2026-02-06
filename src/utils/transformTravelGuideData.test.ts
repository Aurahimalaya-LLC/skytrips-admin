
import { describe, it, expect, vi } from 'vitest';
import { transformTravelGuideData, TravelGuideRow } from './transformTravelGuideData';

describe('transformTravelGuideData', () => {
  it('should transform valid travel guide data correctly', () => {
    const input: TravelGuideRow[] = [
      {
        departure_airport_code: "syd",
        arrival_airport_code: "ktm",
        heading: "  Discover Kathmandu  ",
        description: "Description here",
        image_url: "http://test.com/img.jpg",
        tags: ["  History  ", "Culture"],
        places_of_interest: "Places...",
        getting_around: "Transport...",
      }
    ];

    const result = transformTravelGuideData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      departure_airport: "SYD",
      arrival_airport: "KTM",
      travel_guide_heading: "Discover Kathmandu",
      travel_guide_description: "Description here",
      travel_guide_image: "http://test.com/img.jpg",
      travel_guide_tags: ["History", "Culture"],
      travel_guide_places: "Places...",
      travel_guide_getting_around: "Transport...",
    });
  });

  it('should handle missing identifier fields by skipping the row', () => {
    const input: TravelGuideRow[] = [
      {
        departure_airport_code: "",
        arrival_airport_code: "KTM",
        heading: "Invalid Row",
        description: "",
        image_url: "",
        tags: [],
        places_of_interest: "",
        getting_around: "",
      }
    ];

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = transformTravelGuideData(input);
    
    expect(result).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle empty input array', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = transformTravelGuideData([]);
    
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
