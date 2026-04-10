import { NextResponse } from 'next/server';

const REQUIRED_VARS = [
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

export async function GET() {
  const env: Record<string, boolean> = {};

  for (const key of REQUIRED_VARS) {
    if (key === 'GOOGLE_SERVICE_ACCOUNT_JSON') {
      try {
        const parsed = JSON.parse(process.env[key] ?? '') as Record<string, unknown>;
        env[key] = !!(parsed.client_email && parsed.private_key);
      } catch {
        env[key] = false;
      }
    } else {
      env[key] = !!process.env[key];
    }
  }

  const ok = Object.values(env).every(Boolean);
  return NextResponse.json({ ok, env }, { status: ok ? 200 : 503 });
}
