import Amadeus from 'amadeus';
let singleton: Amadeus | null = null;

export function getAmadeus(): Amadeus {
  if (singleton) return singleton;
  const clientId = process.env.AMADEUS_CLIENT_ID || process.env.AMADEUS_API_KEY || '';
  const clientSecret =
    process.env.AMADEUS_CLIENT_SECRET || process.env.AMADEUS_API_SECRET || '';

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus credentials missing (AMADEUS_CLIENT_ID/AMADEUS_CLIENT_SECRET)');
  }

  const hostname =
    process.env.AMADEUS_HOSTNAME && process.env.AMADEUS_HOSTNAME.toLowerCase() === 'production'
      ? 'production'
      : 'test';

  singleton = new Amadeus({
    clientId,
    clientSecret,
    hostname,
  });
  return singleton;
}
