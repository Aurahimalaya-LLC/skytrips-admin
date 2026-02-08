export interface FAQ {
  question: string;
  answer: string;
}

export interface FastFact {
  label: string;
  value: string;
}

export interface Airport {
  id: string;
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  active: boolean;
  featured_image_url?: string;
  description?: string;
  fast_facts?: FastFact[];
  top_airlines?: string[];
  gallery_urls?: string[];
  faqs?: FAQ[];
  map_embed_code?: string;
  seo_title?: string;
  meta_description?: string;
  seo_image_url?: string;
  slug?: string;
  canonical_url?: string;
  schema_markup?: string;
  no_index?: boolean;
  no_follow?: boolean;
  no_archive?: boolean;
  no_image_index?: boolean;
  no_snippet?: boolean;
}

export interface AirportDBRow {
  id: string;
  iata_code: string;
  name: string;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  published_status?: boolean;
  featured_image_url?: string;
  description?: string;
  fast_facts?: FastFact[] | null;
  top_airlines?: string[] | null;
  gallery_urls?: string[];
  faqs?: FAQ[] | null;
  map_embed_code?: string;
  seo_title?: string | null;
  meta_description?: string | null;
  seo_image_url?: string | null;
  slug?: string | null;
  canonical_url?: string | null;
  schema_markup?: string | null;
  no_index?: boolean | null;
  no_follow?: boolean | null;
  no_archive?: boolean | null;
  no_image_index?: boolean | null;
  no_snippet?: boolean | null;
}

export interface CreateAirportDTO {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  active?: boolean;
  featured_image_url?: string;
  description?: string;
  fast_facts?: FastFact[];
  top_airlines?: string[];
  gallery_urls?: string[];
  faqs?: FAQ[];
  map_embed_code?: string;
  seo_title?: string;
  meta_description?: string;
  seo_image_url?: string;
  slug?: string;
  canonical_url?: string;
  schema_markup?: string;
  no_index?: boolean;
  no_follow?: boolean;
  no_archive?: boolean;
  no_image_index?: boolean;
  no_snippet?: boolean;
}

export type UpdateAirportDTO = Partial<CreateAirportDTO>;
