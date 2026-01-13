import { parsePhoneNumber, CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import { Address, PhoneNumber } from '@/types/company';

// --- Address Utilities ---

export const validateAddress = (address: Address): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!address.street || address.street.length < 5) errors.street = "Street must be at least 5 chars";
    if (!address.city) errors.city = "City is required";
    if (!address.state) errors.state = "State is required";
    if (!address.country) errors.country = "Country is required";
    
    // Postal Code Validation
    if (!address.postalCode) {
        errors.postalCode = "Postal code is required";
    } else {
        const postalRegex = /^[a-zA-Z0-9\s-]{3,10}$/;
        if (!postalRegex.test(address.postalCode)) {
            errors.postalCode = "Invalid postal code format";
        }
    }

    return errors;
};

// --- Phone Utilities ---

export const standardizePhoneNumber = (value: string, country: CountryCode = 'US'): PhoneNumber => {
    try {
        const phoneNumber = parsePhoneNumber(value, country);
        if (phoneNumber && phoneNumber.isValid()) {
            return {
                id: crypto.randomUUID(),
                label: 'Main',
                value: value,
                standardizedValue: phoneNumber.format('E.164'),
                countryCode: phoneNumber.country as string
            };
        }
    } catch (error) {
        // Invalid number
    }
    
    return {
        id: crypto.randomUUID(),
        label: 'Main',
        value: value,
        standardizedValue: value, // Fallback
        countryCode: country
    };
};

export const validatePhone = (value: string, country: CountryCode = 'US'): boolean => {
    try {
        if (isValidPhoneNumber(value, country)) return true;
    } catch (e) {
        // ignore
    }
    // Fallback: Allow basic phone formats if strict validation fails
    // At least 3 characters, allowing numbers, spaces, dashes, plus, parentheses
    return /^[0-9+\-\s()]{3,}$/.test(value);
};

// --- Migration Utility ---

export const migrateLegacyAddress = (legacy: any): Address => {
    return {
        street: legacy.street || '',
        city: legacy.city || '',
        state: legacy.state || '',
        postalCode: legacy.zipCode || legacy.postalCode || '', // Map zipCode to postalCode
        country: legacy.country || '',
        additionalInfo: ''
    };
};
