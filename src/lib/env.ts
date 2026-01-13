/**
 * Environment Configuration and Validation
 * 
 * This module handles loading and validating environment variables.
 * It ensures that all required configuration is present before the application
 * attempts to use it, preventing runtime errors due to missing config.
 */

interface Config {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
}

const requiredClientVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const requiredServerVars = [
  'SUPABASE_SERVICE_ROLE_KEY'
];

/**
 * Validates the presence of required environment variables.
 * Returns an object containing the validated configuration.
 * Logs errors for any missing variables.
 */
export function validateConfig() {
  const missing: string[] = [];
  const config: Config = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    }
  };

  // Check client-side vars explicitly to ensure they are inlined by Next.js
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Check server-side vars only if running on server
  if (typeof window === 'undefined') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      missing.push('SUPABASE_SERVICE_ROLE_KEY');
    }
  }

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(`[Configuration Error] ${errorMsg}`);
    
    // In strict mode, you might want to throw an error
    // throw new Error(errorMsg);
    
    return {
      isValid: false,
      missing,
      config
    };
  }

  return {
    isValid: true,
    missing: [],
    config
  };
}

// Export a singleton instance of the validated config
const validationResult = validateConfig();

export const env = {
  ...validationResult.config,
  isValid: validationResult.isValid,
  missing: validationResult.missing
};
