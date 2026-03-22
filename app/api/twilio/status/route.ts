import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const updateData: Record<string, string | number> = { status: callStatus };
    if (duration) {
      updateData.call_duration_seconds = parseInt(duration, 10);
    }

    await supabase.from('calls').update(updateData).eq('twilio_call_sid', callSid);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Twilio status callback error:', error);
    return NextResponse.json({ error: 'Failed to process status update' }, { status: 500 });
  }
}
