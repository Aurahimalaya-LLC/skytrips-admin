
import { describe, it, expect, vi } from 'vitest';
import { transformSEOSettingsData, SEOSettingsRow } from './transformSEOSettingsData';

describe('transformSEOSettingsData', () => {
  it('should transform valid SEO settings data correctly', () => {
    const input: SEOSettingsRow[] = [
      {
        departure_airport_code: "syd",
        arrival_airport_code: "ktm",
        seo_title: "  My Title  ",
        meta_description: "My Description",
        slug: "my-slug",
        canonical_url: "http://example.com",
        schema_markup: "{}",
        robots_meta_no_index: true,
        robots_meta_no_follow: false,
        robots_meta_no_archive: true,
        robots_meta_no_image_index: false,
        robots_meta_no_snippet: false,
      }
    ];

    const result = transformSEOSettingsData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      departure_airport: "SYD",
      arrival_airport: "KTM",
      seo_title: "My Title",
      meta_description: "My Description",
      slug: "my-slug",
      canonical_url: "http://example.com",
      schema_markup: "{}",
      robots_meta: {
        no_index: true,
        no_follow: false,
        no_archive: true,
        no_image_index: false,
        no_snippet: false,
      },
    });
  });

  it('should handle missing identifier fields by skipping the row', () => {
    const input: SEOSettingsRow[] = [
      {
        departure_airport_code: "",
        arrival_airport_code: "KTM",
        seo_title: "Title",
        meta_description: "",
        slug: "",
        canonical_url: "",
        schema_markup: "",
        robots_meta_no_index: false,
        robots_meta_no_follow: false,
        robots_meta_no_archive: false,
        robots_meta_no_image_index: false,
        robots_meta_no_snippet: false,
      }
    ];

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = transformSEOSettingsData(input);
    
    expect(result).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle empty input array', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = transformSEOSettingsData([]);
    
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
