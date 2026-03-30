import twilio from 'twilio';

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

export async function sendSMS(to: string, body: string): Promise<void> {
  await getTwilioClient().messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER!,
    body,
  });
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
