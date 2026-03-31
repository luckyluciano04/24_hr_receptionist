import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { provisionPhoneNumber } from '@/lib/twilio';
import { logger } from '@/lib/logger';

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
    const areaCode = body.areaCode ?? '415';

    logger.info('twilio.provision_number', { userId: user.id, areaCode });

    const phoneNumber = await provisionPhoneNumber(areaCode);

    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from('profiles')
      .update({ twilio_phone_number: phoneNumber })
      .eq('id', user.id);

    if (updateError) {
      logger.error('twilio.provision_number.update_failed', {
        userId: user.id,
        error: String(updateError),
      });
      return NextResponse.json({ error: 'Failed to save phone number' }, { status: 500 });
    }

    logger.info('twilio.provision_number.success', { userId: user.id, phoneNumber });

    return NextResponse.json({ phoneNumber });
  } catch (error) {
    logger.error('twilio.provision_number.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to provision phone number' }, { status: 500 });
  }
}
