#!/usr/bin/env node
/**
 * Pre-build environment variable gate.
 * Exits with code 1 if any required server-side variable is missing,
 * preventing a broken deployment from reaching Vercel.
 *
 * Add to package.json: "prebuild": "node scripts/check-env.js"
 */

'use strict';

const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const REQUIRED = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
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

try {
  const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('missing client_email/private_key');
  }
} catch (error) {
  console.error('[check-env] ❌ Build blocked — GOOGLE_SERVICE_ACCOUNT_JSON is invalid:', error.message);
  process.exit(1);
}

try {
  new URL(process.env.NEXT_PUBLIC_SITE_URL);
} catch {
  console.error('[check-env] ❌ Build blocked — NEXT_PUBLIC_SITE_URL must be a valid absolute URL.');
  process.exit(1);
}

const annualPriceEnvKeys = [
  'STRIPE_PRICE_STARTER_ANNUAL',
  'STRIPE_PRICE_PROFESSIONAL_ANNUAL',
  'STRIPE_PRICE_ENTERPRISE_ANNUAL',
];
const annualValues = annualPriceEnvKeys.map((key) => process.env[key]);
const hasSomeAnnual = annualValues.some(Boolean);
if (hasSomeAnnual && annualValues.some((value) => !value)) {
  console.error(
    '[check-env] ❌ Build blocked — Annual billing requires all annual price IDs:\n  ' +
      annualPriceEnvKeys.join('\n  '),
  );
  process.exit(1);
}

console.log('[check-env] ✅ All required environment variables are present.');
