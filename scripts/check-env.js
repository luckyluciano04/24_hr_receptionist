#!/usr/bin/env node
/**
 * Pre-build environment variable check.
 * Warns about missing variables so developers know what to configure,
 * but does not block the build — the public landing page works without
 * all secrets, and API-route failures are surfaced at runtime only.
 */

'use strict';

const PRODUCTION_REQUIRED = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const missing = PRODUCTION_REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(
    '[check-env] ⚠️  Missing environment variables (set these before going live):\n  ' +
      missing.join('\n  '),
  );
  console.warn(
    '[check-env] Set these in your .env file (local) or hosting environment (Vercel).',
  );
} else {
  console.log('[check-env] ✅ All environment variables are present.');
}
