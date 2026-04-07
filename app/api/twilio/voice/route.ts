import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateTwilioSignature } from '@/lib/twilio';
import { logger } from '@/lib/logger';

export const maxDuration = 30;

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
      .select('id, business_name')
      .eq('twilio_phone_number', calledNumber)
      .single();

    const businessName = profile?.business_name ?? 'this business';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
    const recordingCallbackUrl = `${appUrl}/api/twilio/recording`;

    // Build TwiML to record the call and process via callback
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for calling ${xmlEscape(businessName)}. Please leave your name, phone number, and the reason for your call after the tone, then press pound when you are finished.</Say>
  <Record action="${xmlEscape(recordingCallbackUrl)}" method="POST" maxLength="120" timeout="5" finishOnKey="#" playBeep="true" trim="trim-silence" />
  <Say voice="Polly.Joanna">We did not receive a message. Please call back later. Goodbye.</Say>
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
