import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/appointments
 * Returns appointments for the authenticated user.
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

    // Resolve call_sids belonging to this user
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
      .from('appointments')
      .select('*')
      .order('time', { ascending: true })
      .limit(limit);

    if (callSids.length > 0) {
      query = query.in('call_sid', callSids);
    } else {
      return NextResponse.json({ appointments: [] });
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Appointments fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    return NextResponse.json({ appointments: appointments ?? [] });
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/appointments
 * Create a new appointment (e.g. booked during a call).
 * Body: { call_sid: string; time: string; status?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      call_sid: string;
      time: string;
      status?: string;
    };

    const { call_sid, time, status = 'pending' } = body;

    if (!call_sid || !time) {
      return NextResponse.json({ error: 'Missing call_sid or time' }, { status: 400 });
    }

    // Verify the call belongs to this user
    const { data: call } = await supabase
      .from('calls')
      .select('id')
      .eq('twilio_call_sid', call_sid)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: 'Call not found or forbidden' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('appointments')
      .insert({ call_sid, time, status, created_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      console.error('Appointment insert error:', error);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }

    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch (error) {
    console.error('Appointments POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/appointments
 * Update an appointment's status or time.
 * Body: { id: string; status?: string; time?: string }
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

    const body = (await request.json()) as {
      id: string;
      status?: string;
      time?: string;
    };

    const { id, status, time } = body;

    if (!id || (!status && !time)) {
      return NextResponse.json({ error: 'Missing id and at least one of status/time' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership
    const admin = createAdminClient();
    const apptResult = await admin
      .from('appointments' as never)
      .select('call_sid')
      .eq('id', id)
      .maybeSingle();
    const appt = apptResult.data as { call_sid: string } | null;

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const { data: call } = await supabase
      .from('calls')
      .select('id')
      .eq('twilio_call_sid', appt.call_sid)
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!call) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updates: Record<string, string> = {};
    if (status) updates.status = status;
    if (time) updates.time = time;

    const { error } = await admin.from('appointments').update(updates).eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appointments PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
