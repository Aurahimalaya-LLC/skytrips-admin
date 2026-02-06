
import { describe, it, expect, vi } from 'vitest';
import { transformContentSectionData, ContentSectionRow } from './transformContentSectionData';

describe('transformContentSectionData', () => {
  it('should transform valid content section data correctly', () => {
    const input: ContentSectionRow[] = [
      {
        departure_airport_code: "syd",
        arrival_airport_code: "ktm",
        section_title: "  Cheap flights  ",
        main_description: "Description...",
        best_time_to_visit: "Oct-Dec",
        flight_duration_and_stopovers: "15h",
      }
    ];

    const result = transformContentSectionData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      departure_airport: "SYD",
      arrival_airport: "KTM",
      content_section_title: "Cheap flights",
      content_section_description: "Description...",
      content_section_best_time: "Oct-Dec",
      content_section_duration_stopovers: "15h",
    });
  });

  it('should handle missing identifier fields by skipping the row', () => {
    const input: ContentSectionRow[] = [
      {
        departure_airport_code: "",
        arrival_airport_code: "KTM",
        section_title: "Title",
        main_description: "",
        best_time_to_visit: "",
        flight_duration_and_stopovers: "",
      }
    ];

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = transformContentSectionData(input);
    
    expect(result).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle empty input array', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = transformContentSectionData([]);
    
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
