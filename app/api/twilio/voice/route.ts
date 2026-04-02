import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { logger } from '@/lib/logger';

// XML-escape a value for use in TwiML text content and attributes
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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const recordingCallback = `${appUrl}/api/twilio/recording`;

    // Save initial call record
    if (profile?.id) {
      await supabase.from('calls').insert({
        profile_id: profile.id,
        caller_phone: callerPhone,
        twilio_call_sid: callSid,
        status: 'in_progress',
      });
    }

    // Use <Record> for Vercel-compatible serverless architecture.
    // Twilio will POST the recording URL and transcription to /api/twilio/recording
    // when the caller hangs up or presses #.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for calling ${xmlEscape(businessName)}. We are unable to take your call right now, but your message is important to us. Please leave your name, the reason for your call, and the best way to reach you after the tone, then press pound or hang up when finished.</Say>
  <Record maxLength="120" action="${xmlEscape(recordingCallback)}" method="POST" transcribe="true" transcribeCallback="${xmlEscape(recordingCallback)}" playBeep="true" finishOnKey="#" />
  <Say>We did not receive a recording. Goodbye.</Say>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    logger.error('twilio.voice.error', { error: String(error) });
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>We are sorry, an error occurred. Please try again later.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } },
    );
  }
}
