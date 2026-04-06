import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateTwilioSignature, sendSMS } from '@/lib/twilio';
import { openai, generateCallSummary } from '@/lib/openai';
import { sendCallNotificationEmail } from '@/lib/resend';
import { appendRow } from '@/lib/sheets';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

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
    const recordingUrl = params['RecordingUrl'] ?? '';
    const recordingStatus = params['RecordingStatus'] ?? '';
    const recordingDuration = parseInt(params['RecordingDuration'] ?? '0', 10);

    logger.info('twilio.recording.received', { callSid, recordingStatus, recordingDuration });

    // Only process completed recordings with audio
    if (recordingStatus !== 'completed' || !recordingUrl) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    const { data: call } = await supabase
      .from('calls')
      .select('profile_id, caller_phone')
      .eq('twilio_call_sid', callSid)
      .single();

    if (!call) {
      logger.warn('twilio.recording.call_not_found', { callSid });
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, phone, business_name, google_sheet_id, tier')
      .eq('id', call.profile_id)
      .single();

    // Download the recording from Twilio (MP3 format)
    const authHeader = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString('base64');

    const recordingResponse = await fetch(`${recordingUrl}.mp3`, {
      headers: { Authorization: `Basic ${authHeader}` },
    });

    if (!recordingResponse.ok) {
      throw new Error(`Failed to download recording: ${recordingResponse.status}`);
    }

    const audioBuffer = await recordingResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], 'recording.mp3', { type: 'audio/mpeg' });

    // Transcribe with OpenAI Whisper
    const transcriptionResult = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
    });
    const transcript = transcriptionResult.text ?? '';

    logger.info('twilio.recording.transcribed', { callSid, length: transcript.length });

    // Generate summary with GPT-4o
    const summary = await generateCallSummary(transcript);

    // Extract caller name from transcript
    const callerNameResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "Extract the caller's name from this voicemail transcript. Return only the name, or \"Unknown\" if the name is not mentioned.",
        },
        { role: 'user', content: transcript },
      ],
      max_tokens: 50,
    });
    const callerName = callerNameResponse.choices[0]?.message?.content?.trim() ?? 'Unknown';

    // Update the call record with transcript and summary
    await supabase
      .from('calls')
      .update({
        caller_name: callerName,
        call_transcript: transcript,
        call_summary: summary,
        call_duration_seconds: recordingDuration,
        status: 'completed',
        delivered_via: [],
      })
      .eq('twilio_call_sid', callSid);

    // Increment call count
    await supabase.rpc('increment_calls', { profile_id: call.profile_id });

    const deliveredVia: string[] = [];

    logger.info('twilio.call.completed', { callSid, callerName, duration: recordingDuration });

    // Send email notification
    if (profile?.email) {
      try {
        await sendCallNotificationEmail(
          profile.email,
          profile.business_name ?? '',
          callerName,
          call.caller_phone ?? '',
          summary,
          recordingDuration,
        );
        deliveredVia.push('email');
      } catch (err) {
        logger.error('twilio.recording.email_failed', { callSid, error: String(err) });
      }
    }

    // Send SMS notification (professional/enterprise only)
    if (profile?.phone && (profile.tier === 'professional' || profile.tier === 'enterprise')) {
      try {
        await sendSMS(
          profile.phone,
          `New call from ${callerName} (${call.caller_phone ?? ''}): ${summary}`,
        );
        deliveredVia.push('sms');
      } catch (err) {
        logger.error('twilio.recording.sms_failed', { callSid, error: String(err) });
      }
    }

    // Append to Google Sheets
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

    // Update delivered_via with actual delivery channels
    await supabase
      .from('calls')
      .update({ delivered_via: deliveredVia })
      .eq('twilio_call_sid', callSid);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('twilio.recording.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to process recording' }, { status: 500 });
  }
}
