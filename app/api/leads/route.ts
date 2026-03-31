import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/leads
 * Returns all leads visible to the authenticated user.
 * Supports ?status= and ?limit= query params.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the profile to get all call_sids belonging to this user
    const { data: calls } = await supabase
      .from('calls')
      .select('twilio_call_sid')
      .eq('profile_id', user.id);

    const callSids = (calls ?? []).map((c) => c.twilio_call_sid).filter(Boolean) as string[];

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

    const admin = createAdminClient();
    let query = admin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (callSids.length > 0) {
      query = query.in('call_sid', callSids);
    } else {
      // No calls yet – return empty
      return NextResponse.json({ leads: [] });
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Leads fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return NextResponse.json({ leads: leads ?? [] });
  } catch (error) {
    console.error('Leads GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/leads
 * Update a lead's status.
 * Body: { id: string; status: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { id: string; status: string };
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['new', 'contacted', 'qualified', 'closed', 'lost'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership: the lead's call_sid must belong to this user
    // Use the admin client (service role) because the new `leads` table has no
    // user-scoped RLS policy yet; ownership is checked against `calls` below.
    const admin = createAdminClient();
    const leadResult = await admin
      .from('leads' as never)
      .select('call_sid')
      .eq('id', id)
      .maybeSingle();
    const lead = leadResult.data as { call_sid: string } | null;

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const { data: call } = await supabase
      .from('calls')
      .select('id')
      .eq('twilio_call_sid', lead.call_sid)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await admin.from('leads').update({ status }).eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leads PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
