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
}

export interface UpdateAirportDTO extends Partial<CreateAirportDTO> {}
