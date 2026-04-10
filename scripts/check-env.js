#!/usr/bin/env node
/**
 * Pre-build environment variable check.
 * Warns about missing variables so developers know what to configure,
 * but does NOT exit non-zero — the public landing page works without
 * all secrets, and API-route failures are surfaced at runtime only.
 *
 * This intentionally avoids process.exit(1) so that Vercel preview
 * and staging builds still succeed even when optional secrets are absent.
 */

'use strict';

const REQUIRED = [
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
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(
    '[check-env] ⚠️  Missing environment variables (set these before going live):\n  ' +
      missing.join('\n  '),
  );
  console.warn(
    '[check-env] Set these in your .env file (local) or Vercel project settings (production).',
  );
} else {
  console.log('[check-env] ✅ All environment variables are present.');
}
