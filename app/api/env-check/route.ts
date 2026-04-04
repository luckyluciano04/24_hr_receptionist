import { NextResponse } from 'next/server';

const REQUIRED_SERVER_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'RESEND_API_KEY',
];

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

export async function GET() {
  try {
    const missing: string[] = [];

    for (const key of REQUIRED_SERVER_VARS) {
      if (!process.env[key]) missing.push(key);
    }

    for (const key of REQUIRED_PUBLIC_VARS) {
      if (!process.env[key]) missing.push(key);
    }

    if (missing.length > 0) {
      return NextResponse.json(
        { status: 'missing', missing },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: 'ok', loaded: REQUIRED_SERVER_VARS.length + REQUIRED_PUBLIC_VARS.length });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
