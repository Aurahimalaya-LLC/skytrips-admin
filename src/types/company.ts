export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
}

export interface PhoneNumber {
    id: string;
    label: string;
    value: string;
    standardizedValue?: string;
    countryCode?: string;
}

export interface ContactMethod {
  id: string;
  label: string;
  value: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  address: Address;
  emails: ContactMethod[];
  phones: PhoneNumber[];
  website?: string;
  operatingHours?: string;
  isHeadquarters: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // For soft delete
}

export type CompanyFormData = Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
