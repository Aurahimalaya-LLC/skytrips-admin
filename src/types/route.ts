export interface Route {
  id: string;
  airline_id: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: 'Scheduled' | 'Delayed' | 'Cancelled' | 'Completed';
  aircraft_type?: string;
  capacity?: number;
  available_seats?: number;
  
  // New fields (moved to route_info JSONB)
  route_info?: {
    average_flight_time?: string;
    distance?: string;
    cheapest_month?: string;
    daily_flights?: number;
  };

  // Deprecated flat fields (kept for type safety during migration if needed, but should be removed)
  // average_flight_time?: string;
  // distance?: string;
  // cheapest_month?: string;
  // daily_flights?: number;
  
  featured_image?: string;
  description?: string;
  other_popular_routes?: any[]; // JSONB array

  // Things to Note Section
  things_to_note_origin_airport?: string;
  things_to_note_time_diff?: string;
  things_to_note_currency?: string;
  things_to_note_power_plugs?: string;

  // Travel Guide Section
  travel_guide_heading?: string;
  travel_guide_description?: string;
  travel_guide_image?: string;
  travel_guide_tags?: string[];
  travel_guide_places?: string;
  travel_guide_getting_around?: string;

  // Content Section (Accordion Style)
  content_sections?: {
    title?: string;
    description?: string;
    best_time?: string;
    duration_stopovers?: string;
  };
  // Deprecated flat content fields
  // content_section_title?: string;
  // content_section_description?: string;
  // content_section_best_time?: string;
  // content_section_duration_stopovers?: string;

  // Hero Section
  hero_headline?: string;
  hero_subtitle?: string;
  hero_sections?: { 
    headline: string; 
    subtitle: string;
    cta_text?: string;
    cta_url?: string;
  }[];

  // FAQs
  faqs?: { question: string; answer: string }[];

  // Media Gallery (New)
  media_gallery?: {
    id: string;
    url: string;
    type: 'image' | 'video';
    alt?: string;
    thumbnail?: string;
  }[];

  // Rich Text Description (New)
  rich_description?: {
    content: string; // HTML/Markdown
    sections?: {
      heading: string;
      content: string;
      image?: string;
      expanded?: boolean;
    }[];
  };

  // SEO Section
  seo_title?: string;
  meta_description?: string;
  slug?: string;
  canonical_url?: string;
  schema_markup?: string;
  robots_meta?: {
    no_index?: boolean;
    no_follow?: boolean;
    no_archive?: boolean;
    no_image_index?: boolean;
    no_snippet?: boolean;
  };

  seo_settings?: {
    title?: string;
    description?: string;
    canonical_url?: string;
    schema_markup?: string;
    robots?: {
      no_index?: boolean;
      no_follow?: boolean;
      no_archive?: boolean;
      no_image_index?: boolean;
      no_snippet?: boolean;
    };
  };

  created_at?: string;
  updated_at?: string;
  airline?: {
    name: string;
    iata_code: string;
    logo_url?: string;
  };
}
