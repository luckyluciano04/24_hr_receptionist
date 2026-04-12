/**
 * Runtime environment variable helpers.
 * Import this module in server-side code to read required vars with an explicit
 * error when they are missing — rather than silently returning undefined.
 */

export const REQUIRED_SERVER_ENV_VARS = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
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
  'NEXT_PUBLIC_SITE_URL',
] as const;

type RequiredEnvVar = (typeof REQUIRED_SERVER_ENV_VARS)[number];

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
