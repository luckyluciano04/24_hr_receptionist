import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { appendRow } from '@/lib/sheets';
import { logger } from '@/lib/logger';

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
    // Require an authenticated session
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as SyncPayload;
    const { profileId, email, businessName, contactName, phone, tier, callCount, status, lastCall, notes } = body;

    if (!profileId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure the authenticated user can only sync their own profile
    if (user.id !== profileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    logger.error('sheets.sync.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to sync to Google Sheets' }, { status: 500 });
  }
}
