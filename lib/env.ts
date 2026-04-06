/**
 * Runtime environment variable validation.
 * Import this module in server-side code to ensure required vars are present.
 * Throws an explicit error at startup (fail-fast) if any required var is missing.
 */

const REQUIRED_SERVER_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PROFESSIONAL',
  'STRIPE_PRICE_ENTERPRISE',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT_JSON',
  'NEXT_PUBLIC_APP_URL',
] as const;

type RequiredEnvVar = (typeof REQUIRED_SERVER_ENV_VARS)[number];

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(', ')}. ` +
        'Set them in your .env file or hosting environment.',
    );
  }
}

/**
 * Returns a required environment variable, throwing if it is absent.
 * Use on the server only — never expose secret vars to the client bundle.
 */
export function requireEnv(key: RequiredEnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

// Validate on module load so misconfigured deployments fail immediately.
validateEnv();
