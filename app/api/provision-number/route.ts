import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { twilioClient } from '@/lib/twilio';
import { logger } from '@/lib/logger';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { areaCode?: string };
    const areaCode = body.areaCode;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

    // Search for available local numbers
    const searchParams: { limit: number; areaCode?: number } = { limit: 1 };
    if (areaCode) {
      const areaCodeNum = parseInt(areaCode, 10);
      if (!isNaN(areaCodeNum)) {
        searchParams.areaCode = areaCodeNum;
      }
    }

    const availableNumbers = await twilioClient
      .availablePhoneNumbers('US')
      .local.list(searchParams);

    if (availableNumbers.length === 0) {
      return NextResponse.json(
        { error: 'No phone numbers available for that area code. Please try a different area code.' },
        { status: 404 },
      );
    }

    // Purchase the phone number and configure webhooks
    const incomingNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: availableNumbers[0].phoneNumber,
      voiceUrl: `${appUrl}/api/twilio/voice`,
      voiceMethod: 'POST',
      statusCallback: `${appUrl}/api/twilio/status`,
      statusCallbackMethod: 'POST',
    });

    logger.info('twilio.provision_number.success', {
      userId: user.id,
      phoneNumber: incomingNumber.phoneNumber,
    });

    // Save the provisioned number to the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ twilio_phone_number: incomingNumber.phoneNumber })
      .eq('id', user.id);

    if (updateError) {
      logger.error('twilio.provision_number.profile_update_failed', {
        userId: user.id,
        error: String(updateError),
      });
      throw updateError;
    }

    return NextResponse.json({ phone: incomingNumber.phoneNumber });
  } catch (error) {
    logger.error('twilio.provision_number.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to provision phone number' }, { status: 500 });
  }
}
