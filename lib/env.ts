/**
 * Runtime environment variable validation.
 * Import this module in server-side code to ensure required vars are present.
 * Call requireEnv() to get a required variable; it throws if the value is absent.
 */

type RequiredEnvVar =
  | 'STRIPE_SECRET_KEY'
  | 'STRIPE_WEBHOOK_SECRET'
  | 'TWILIO_ACCOUNT_SID'
  | 'TWILIO_AUTH_TOKEN'
  | 'TWILIO_PHONE_NUMBER'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'OPENAI_API_KEY'
  | 'RESEND_API_KEY';

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
