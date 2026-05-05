import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { sendSMS } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

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
      updateData.duration = parseInt(duration, 10);
    }

    await supabase.from('calls').update(updateData).eq('twilio_call_sid', callSid);

    // Send SMS alert if status indicates end of call
    if (callStatus === 'completed' || callStatus === 'no-answer' || callStatus === 'busy' || callStatus === 'failed') {
      const { data: call } = await supabase
        .from('calls')
        .select('user_id, from_number, duration')
        .eq('twilio_call_sid', callSid)
        .single();

      if (call?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, tier')
          .eq('id', call.user_id)
          .single();

        if (profile?.phone && (profile.tier === 'professional' || profile.tier === 'enterprise')) {
          const dur = call.duration || 0;
          try {
            await sendSMS(profile.phone, `New Call:\nFrom: ${call.from_number}\nStatus: ${callStatus}\nDuration: ${dur}s`);
            logger.info('twilio.status.sms_sent', { callSid, to: profile.phone, status: callStatus });
          } catch (err) {
            logger.error('twilio.status.sms_failed', { callSid, error: String(err) });
            // Retry once
            try {
              await sendSMS(profile.phone, `New Call:\nFrom: ${call.from_number}\nStatus: ${callStatus}\nDuration: ${dur}s`);
              logger.info('twilio.status.sms_retry_success', { callSid, to: profile.phone, status: callStatus });
            } catch (retryErr) {
              logger.error('twilio.status.sms_retry_failed', { callSid, error: String(retryErr) });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('twilio.status.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to process status update' }, { status: 500 });
  }
}
