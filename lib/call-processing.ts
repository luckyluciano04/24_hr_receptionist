import { createAdminClient } from './supabase/server';
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
  transcript: _transcript,
  summary,
  callerName,
  duration,
}: CompletedCallPayload): Promise<boolean> {
  const supabase = createAdminClient();

  const { data: call } = await supabase
    .from('calls')
    .select('user_id, from_number')
    .eq('twilio_call_sid', callSid)
     .single();

  if (!call) {
    return false;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, phone, business_name, google_sheet_id, tier')
    .eq('id', call.user_id)
    .single();

  await supabase
    .from('calls')
    .update({
      duration,
      status: 'completed',
    })
    .eq('twilio_call_sid', callSid);

  await supabase.rpc('increment_calls', { profile_id: call.user_id });

  // Update usage tracking
  if (duration > 0) {
    await supabase
      .from('profiles')
      .update({
        usage_calls: supabase.raw('COALESCE(usage_calls, 0) + 1'),
        usage_minutes: supabase.raw('COALESCE(usage_minutes, 0) + ?', [Math.ceil(duration / 60)]),
      })
      .eq('id', call.user_id);
  }

  const deliveredVia: string[] = [];

  logger.info('twilio.call.completed', { callSid, callerName, duration });

  if (profile?.email) {
    try {
      await sendCallNotificationEmail(
        profile.email,
        profile.business_name ?? '',
        callerName,
        call.from_number ?? '',
        summary,
        duration,
      );
      deliveredVia.push('email');
    } catch (err) {
      logger.error('twilio.call.email_failed', { callSid, error: String(err) });
    }
  }

  if (profile?.google_sheet_id) {
    try {
      await appendRow(profile.google_sheet_id, [
        new Date().toISOString(),
        profile.business_name ?? '',
        callerName,
        call.from_number ?? '',
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

  return true;
}
