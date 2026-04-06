import { NextRequest, NextResponse } from 'next/server';
import { completeCall } from '@/lib/call-processing';
import { generateCallInsights, transcribeAudio } from '@/lib/openai';
import { logger } from '@/lib/logger';
import { validateTwilioSignature } from '@/lib/twilio';

export const maxDuration = 60;

function twimlMessage(message: string): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">${message}</Say></Response>`,
    { headers: { 'Content-Type': 'text/xml' } },
  );
}

async function fetchRecording(recordingUrl: string): Promise<File> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error('Missing Twilio credentials for recording fetch');
  }

  const url = recordingUrl.endsWith('.mp3') ? recordingUrl : `${recordingUrl}.mp3`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recording: ${response.status}`);
  }

  const type = response.headers.get('content-type') ?? 'audio/mpeg';
  const bytes = await response.arrayBuffer();
  return new File([bytes], 'twilio-recording.mp3', { type });
}

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
    const duration = parseInt(params['RecordingDuration'] ?? '0', 10) || 0;

    if (!callSid || !recordingUrl) {
      return twimlMessage('We could not process your message. Please call back later. Goodbye.');
    }

    const file = await fetchRecording(recordingUrl);
    const transcript = await transcribeAudio(file);
    const { callerName, summary } = await generateCallInsights(transcript);
    const completed = await completeCall({
      callSid,
      transcript,
      summary,
      callerName,
      duration,
    });

    if (!completed) {
      logger.warn('twilio.recording.call_not_found', { callSid });
    }

    return twimlMessage('Thank you. Your message has been received. Goodbye.');
  } catch (error) {
    logger.error('twilio.recording.error', { error: String(error) });
    return twimlMessage('We are sorry, something went wrong. Please try again later. Goodbye.');
  }
}
