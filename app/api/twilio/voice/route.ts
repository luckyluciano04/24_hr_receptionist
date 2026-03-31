import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { buildSystemPrompt } from '@/lib/openai';
import { sendSMS, validateTwilioSignature } from '@/lib/twilio';
import { sendCallNotificationEmail } from '@/lib/resend';
import { appendRow } from '@/lib/sheets';
import { logger } from '@/lib/logger';

// XML-escape a value for use in TwiML attributes
function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    if (!validateTwilioSignature(request, params)) {
      logger.warn('twilio.voice.invalid_signature', { url: request.url });
      return new NextResponse(null, { status: 401 });
    }

    const calledNumber = params['To'] ?? '';
    const callerPhone = params['From'] ?? '';
    const callSid = params['CallSid'] ?? '';

    logger.info('twilio.voice.incoming', { callSid, callerPhone, calledNumber });

    if (!calledNumber) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, an error occurred.</Say></Response>',
        { headers: { 'Content-Type': 'text/xml' } },
      );
    }

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, business_name, email, phone, tier, google_sheet_id')
      .eq('twilio_phone_number', calledNumber)
      .single();

    const businessName = profile?.business_name ?? 'this business';
    const systemPrompt = buildSystemPrompt(businessName);

    // Build TwiML to connect to OpenAI Realtime via Media Streams
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const wsUrl = appUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for calling ${xmlEscape(businessName)}. Please hold for a moment while we connect you.</Say>
  <Connect>
    <Stream url="${xmlEscape(wsUrl)}/api/twilio/stream">
      <Parameter name="businessName" value="${xmlEscape(businessName)}" />
      <Parameter name="profileId" value="${xmlEscape(profile?.id ?? '')}" />
      <Parameter name="callerPhone" value="${xmlEscape(callerPhone)}" />
      <Parameter name="callSid" value="${xmlEscape(callSid)}" />
      <Parameter name="systemPrompt" value="${xmlEscape(encodeURIComponent(systemPrompt))}" />
    </Stream>
  </Connect>
</Response>`;

    // Save initial call record
    if (profile?.id) {
      await supabase.from('calls').insert({
        profile_id: profile.id,
        caller_phone: callerPhone,
        twilio_call_sid: callSid,
        status: 'in_progress',
      });
    }

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    logger.error('twilio.voice.error', { error: String(error) });
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>We\'re sorry, an error occurred. Please try again later.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } },
    );
  }
}

// Called after call ends with transcript/summary
export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      callSid: string;
      transcript: string;
      summary: string;
      callerName: string;
      duration: number;
    };

    const { callSid, transcript, summary, callerName, duration } = body;
    const supabase = createAdminClient();

    const { data: call } = await supabase
      .from('calls')
      .select('profile_id, caller_phone')
      .eq('twilio_call_sid', callSid)
      .single();

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
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

    // Increment call count
    await supabase.rpc('increment_calls', { profile_id: call.profile_id });

    const deliveredVia: string[] = [];

    logger.info('twilio.call.completed', { callSid, callerName, duration });

    // Send notifications
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
        await sendSMS(
          profile.phone,
          `New call from ${callerName} (${call.caller_phone}): ${summary}`,
        );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('twilio.call.completion_error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to process call completion' }, { status: 500 });
  }
}
