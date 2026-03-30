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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TallyPayload;
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
