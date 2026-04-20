import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    if (!validateTwilioSignature(request, params)) {
      logger.warn('twilio.status.invalid_signature', { url: request.url });
      return new NextResponse(null, { status: 401 });
    }

    const callSid = params['CallSid'] ?? '';
    const callStatus = params['CallStatus'] ?? '';
    const duration = params['CallDuration'] ?? '';

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    logger.info('twilio.status.update', { callSid, callStatus, duration });

    const supabase = createAdminClient();

    const updateData: Record<string, string | number> = { status: callStatus };
    if (duration) {
      updateData.call_duration_seconds = parseInt(duration, 10);
    }

    await supabase.from('calls').update(updateData).eq('twilio_call_sid', callSid);

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('twilio.status.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to process status update' }, { status: 500 });
  }
}
