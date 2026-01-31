declare module 'amadeus' {
  class Amadeus {
    constructor(options: { 
      clientId: string; 
      clientSecret: string; 
      hostname?: string;
      logLevel?: string;
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shopping: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    referenceData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analytics: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    media: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    travel: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eReputation: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ordering: any;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  export default Amadeus;
}
