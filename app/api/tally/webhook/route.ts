import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { appendRow } from '@/lib/sheets';
import { sendWelcomeEmail } from '@/lib/resend';

interface TallyField {
  key: string;
  label: string;
  type: string;
  value: string | number | boolean | string[];
}

interface TallyPayload {
  data: {
    fields: TallyField[];
    submittedAt?: string;
  };
}

function getField(fields: TallyField[], label: string): string {
  const field = fields.find(
    (f) => f.label.toLowerCase().includes(label.toLowerCase()),
  );
  if (!field) return '';
  const val = field.value;
  if (Array.isArray(val)) return val.join(', ');
  return String(val ?? '');
}

async function verifyTallySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expected = Buffer.from(sigBuffer).toString('hex');
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signingSecret = process.env.TALLY_SIGNING_SECRET;
  if (signingSecret) {
    const signature = request.headers.get('tally-signature') ?? '';
    const valid = await verifyTallySignature(rawBody, signature, signingSecret);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  try {
    const body = JSON.parse(rawBody) as TallyPayload;
    const fields = body?.data?.fields ?? [];

    const businessName = getField(fields, 'business name');
    const contactName = getField(fields, 'contact') || getField(fields, 'name');
    const phone = getField(fields, 'phone');
    const email = getField(fields, 'email');
    const callVolume = getField(fields, 'call volume') || getField(fields, 'calls');
    const industry = getField(fields, 'industry');
    const howHeard = getField(fields, 'how') || getField(fields, 'heard');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    await supabase.from('profiles').upsert(
      {
        email,
        business_name: businessName,
        phone,
      },
      { onConflict: 'email' },
    );

    // Push to Google Sheets if sheet ID is available
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_sheet_id')
      .eq('email', email)
      .single();

    if (profile?.google_sheet_id) {
      try {
        await appendRow(profile.google_sheet_id, [
          new Date().toISOString(),
          businessName,
          contactName,
          phone,
          email,
          'starter',
          callVolume,
          'New Lead',
          '',
          `Industry: ${industry}. Heard via: ${howHeard}`,
        ]);
      } catch (sheetErr) {
        console.error('Failed to sync to Google Sheets:', sheetErr);
      }
    }

    await sendWelcomeEmail(email, contactName || businessName || email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tally webhook error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
