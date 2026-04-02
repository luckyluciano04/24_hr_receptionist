import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { sendSMS } from '@/lib/twilio';
import { generateCallSummary } from '@/lib/openai';
import { sendCallNotificationEmail } from '@/lib/resend';
import { appendRow } from '@/lib/sheets';
import { logger } from '@/lib/logger';

/**
 * Handles Twilio recording and transcription callbacks.
 * Twilio POSTs here after a call recording finishes (action callback)
 * and again when transcription is complete (transcribeCallback).
 *
 * We deduplicate by checking whether the call record already has a transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    if (!validateTwilioSignature(request, params)) {
      logger.warn('twilio.recording.invalid_signature', { url: request.url });
      return new NextResponse(null, { status: 401 });
    }

    const callSid = params['CallSid'] ?? '';
    const transcriptionText = params['TranscriptionText'] ?? '';
    const recordingDuration = params['RecordingDuration'] ?? '';
    const recordingUrl = params['RecordingUrl'] ?? '';

    logger.info('twilio.recording.received', {
      callSid,
      hasTranscription: !!transcriptionText,
      recordingDuration,
    });

    if (!callSid) {
      return NextResponse.json({ error: 'Missing CallSid' }, { status: 400 });
    }

    // If Twilio hasn't provided a transcription yet (action callback), acknowledge and wait
    // for the transcribeCallback which will include the transcript.
    if (!transcriptionText) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    const { data: call } = await supabase
      .from('calls')
      .select('profile_id, caller_phone, call_transcript')
      .eq('twilio_call_sid', callSid)
      .single();

    if (!call) {
      logger.warn('twilio.recording.call_not_found', { callSid });
      return NextResponse.json({ received: true });
    }

    // Avoid processing twice if already completed
    if (call.call_transcript) {
      return NextResponse.json({ received: true });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, phone, business_name, google_sheet_id, tier')
      .eq('id', call.profile_id)
      .single();

    const duration = recordingDuration ? parseInt(recordingDuration, 10) : 0;

    // Summarize with OpenAI
    let summary = 'No summary available';
    let callerName = 'Unknown Caller';
    try {
      summary = await generateCallSummary(transcriptionText);
      // Attempt to extract caller name from transcript
      const nameMatch = transcriptionText.match(/(?:my name is|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch?.[1]) {
        callerName = nameMatch[1];
      }
    } catch (err) {
      logger.error('twilio.recording.summarize_failed', { callSid, error: String(err) });
    }

    // Update call record
    await supabase
      .from('calls')
      .update({
        caller_name: callerName,
        call_transcript: transcriptionText,
        call_summary: summary,
        call_duration_seconds: duration,
        status: 'completed',
        recording_url: recordingUrl || null,
      })
      .eq('twilio_call_sid', callSid);

    // Increment call count
    await supabase.rpc('increment_calls', { profile_id: call.profile_id });

    const deliveredVia: string[] = [];

    logger.info('twilio.recording.processing', { callSid, callerName, duration });

    // Email notification
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
        logger.error('twilio.recording.email_failed', { callSid, error: String(err) });
      }
    }

    // SMS notification (professional and enterprise tiers)
    if (profile?.phone && (profile.tier === 'professional' || profile.tier === 'enterprise')) {
      try {
        await sendSMS(
          profile.phone,
          `New call from ${callerName} (${call.caller_phone ?? 'unknown'}): ${summary}`,
        );
        deliveredVia.push('sms');
      } catch (err) {
        logger.error('twilio.recording.sms_failed', { callSid, error: String(err) });
      }
    }

    // Google Sheets sync
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
        logger.error('twilio.recording.sheets_failed', { callSid, error: String(err) });
      }
    }

    if (deliveredVia.length > 0) {
      await supabase
        .from('calls')
        .update({ delivered_via: deliveredVia })
        .eq('twilio_call_sid', callSid);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('twilio.recording.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to process recording' }, { status: 500 });
  }
}
