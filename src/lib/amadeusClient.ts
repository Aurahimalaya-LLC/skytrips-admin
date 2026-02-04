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

  const env = process.env.AMADEUS_HOSTNAME || process.env.AMADEUS_ENV || 'test';
  const hostname = env.toLowerCase() === 'production' ? 'production' : 'test';

  let host: string | undefined;
  if (process.env.AMADEUS_BASE_URL) {
    try {
      const urlStr = process.env.AMADEUS_BASE_URL.replace(/['"]/g, ''); // Remove quotes if present
      if (urlStr.startsWith('http')) {
        host = new URL(urlStr).hostname;
      } else {
        host = urlStr;
      }
    } catch (e) {
      console.warn('Invalid AMADEUS_BASE_URL, falling back to default hostname logic', e);
    }
  }

  singleton = new Amadeus({
    clientId,
    clientSecret,
    hostname,
    ...(host ? { host } : {}),
  });
  return singleton;
}
