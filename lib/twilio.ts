import twilio, { validateRequest } from 'twilio';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error('Missing Twilio environment variables');
  }
  return twilio(sid, token);
}

let _client: ReturnType<typeof twilio> | null = null;
function getTwilioClient() {
  if (!_client) _client = getClient();
  return _client;
}

export const twilioClient = new Proxy({} as ReturnType<typeof twilio>, {
  get(_target, prop) {
    const client = getTwilioClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Validates that an incoming request originates from Twilio by verifying
 * the X-Twilio-Signature header against the request URL and POST params.
 * Returns false (and logs a warning) if TWILIO_AUTH_TOKEN is not configured.
 */
export function validateTwilioSignature(
  request: NextRequest,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    logger.warn('twilio.validate_signature.missing_auth_token', {
      url: request.url,
      msg: 'TWILIO_AUTH_TOKEN is not set — rejecting request for safety',
    });
    return false;
  }
  const signature = request.headers.get('x-twilio-signature') ?? '';
  return validateRequest(authToken, signature, request.url, params);
}

export async function sendSMS(to: string, body: string): Promise<void> {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error('Missing TWILIO_PHONE_NUMBER environment variable');
  }
  await getTwilioClient().messages.create({ to, from, body });
}

export async function provisionPhoneNumber(areaCode: string = '415'): Promise<string> {
  const client = getTwilioClient();
  const available = await client.availablePhoneNumbers('US').local.list({
    areaCode: parseInt(areaCode, 10),
    limit: 1,
  });

  if (available.length === 0) {
    throw new Error('No available phone numbers in that area code');
  }

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: available[0].phoneNumber,
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
    voiceMethod: 'POST',
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`,
    statusCallbackMethod: 'POST',
  });

  return purchased.phoneNumber;
}
