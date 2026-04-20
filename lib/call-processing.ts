import { createAdminClient } from './supabase/server';
import { sendSMS } from '@/lib/twilio';
import { sendCallNotificationEmail } from '@/lib/resend';
import { appendRow } from '@/lib/sheets';
import { logger } from '@/lib/logger';

export interface CompletedCallPayload {
  callSid: string;
  transcript: string;
  summary: string;
  callerName: string;
  duration: number;
}

export async function completeCall({
  callSid,
  transcript,
  summary,
  callerName,
  duration,
}: CompletedCallPayload): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: call } = await supabase
    .from('calls')
    .select('profile_id, caller_phone')
    .eq('twilio_call_sid', callSid)
    .single();

  if (!call) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, phone, business_name, google_sheet_id, tier')
    .eq('id', call.profile_id)
    .single();

  await supabase
    .from('calls')
    .update({
      caller_name: callerName,
      call_transcript: transcript,
      call_summary: summary,
      call_duration_seconds: duration,
      status: 'completed',
      delivered_via: ['email'],
    })
    .eq('twilio_call_sid', callSid);

  await supabase.rpc('increment_calls', { profile_id: call.profile_id });

  const deliveredVia: string[] = [];

  logger.info('twilio.call.completed', { callSid, callerName, duration });

  if (profile?.email) {
    try {
      await sendCallNotificationEmail(
        profile.email,
        profile.business_name ?? '',
        callerName,
        call.caller_phone ?? '',
        summary,
        duration,
      );
      deliveredVia.push('email');
    } catch (err) {
      logger.error('twilio.call.email_failed', { callSid, error: String(err) });
    }
  }

  if (profile?.phone && (profile.tier === 'professional' || profile.tier === 'enterprise')) {
    try {
      await sendSMS(profile.phone, `New call from ${callerName} (${call.caller_phone}): ${summary}`);
      deliveredVia.push('sms');
    } catch (err) {
      logger.error('twilio.call.sms_failed', { callSid, error: String(err) });
    }
  }

  if (profile?.google_sheet_id) {
    try {
      await appendRow(profile.google_sheet_id, [
        new Date().toISOString(),
        profile.business_name ?? '',
        callerName,
        call.caller_phone ?? '',
        profile.email ?? '',
        profile.tier ?? '',
        '',
        'Call Received',
        new Date().toISOString(),
        summary,
      ]);
    } catch (err) {
      logger.error('twilio.call.sheets_failed', { callSid, error: String(err) });
    }
  }

  await supabase
    .from('calls')
    .update({ delivered_via: deliveredVia })
    .eq('twilio_call_sid', callSid);

  return true;
}
