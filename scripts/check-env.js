#!/usr/bin/env node
/**
 * Pre-build environment variable gate.
 * Exits with code 1 if any required server-side variable is missing,
 * preventing a broken deployment from reaching Vercel.
 *
 * Add to package.json: "prebuild": "node scripts/check-env.js"
 */

'use strict';

const REQUIRED = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    '[check-env] ❌ Build blocked — missing required environment variables:\n  ' +
      missing.join('\n  '),
  );
  console.error(
    '[check-env] Set these in your .env file (local) or hosting environment (Vercel).',
  );
  process.exit(1);
}

console.log('[check-env] ✅ All required environment variables are present.');
