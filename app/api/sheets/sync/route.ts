import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { appendRow } from '@/lib/sheets';

export const maxDuration = 60;

interface SyncPayload {
  profileId: string;
  email: string;
  businessName: string;
  contactName?: string;
  phone?: string;
  tier: string;
  callCount?: number;
  status?: string;
  lastCall?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SyncPayload;
    const { profileId, email, businessName, contactName, phone, tier, callCount, status, lastCall, notes } = body;

    if (!profileId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('google_sheet_id')
      .eq('id', profileId)
      .single();

    if (!profile?.google_sheet_id) {
      return NextResponse.json({ error: 'No Google Sheet configured' }, { status: 400 });
    }

    await appendRow(profile.google_sheet_id, [
      new Date().toISOString(),
      businessName,
      contactName ?? '',
      phone ?? '',
      email,
      tier,
      String(callCount ?? 0),
      status ?? 'Active',
      lastCall ?? '',
      notes ?? '',
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sheets sync error:', error);
    return NextResponse.json({ error: 'Failed to sync to Google Sheets' }, { status: 500 });
  }
}
