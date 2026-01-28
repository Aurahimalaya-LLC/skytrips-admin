export interface FAQ {
  question: string;
  answer: string;
}

export interface FastFact {
  label: string;
  value: string;
}

export interface Airport {
  id: number;
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
}

export interface AirportDBRow {
  id: number;
  iata_code: string;
  name: string;
  municipality: string | null;
  iso_country: string | null;
  latitude_deg: number | null;
  longitude_deg: number | null;
  timezone: string | null;
  popularity?: number;
  published_status?: boolean;
  featured_image_url?: string;
  description?: string;
  fast_facts?: FastFact[] | null;
  top_airlines?: string[] | null;
  gallery_urls?: string[];
  faqs?: FAQ[] | null;
  map_embed_code?: string;
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
}

export interface UpdateAirportDTO extends Partial<CreateAirportDTO> {}
