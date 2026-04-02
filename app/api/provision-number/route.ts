import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Check if user already has a number
    const { data: profile } = await supabase
      .from('profiles')
      .select('twilio_phone_number')
      .eq('id', user.id)
      .single();

    if (profile?.twilio_phone_number) {
      return NextResponse.json({ phoneNumber: profile.twilio_phone_number });
    }

    const body = (await request.json()) as { areaCode?: string };
    const areaCode = body.areaCode ?? '415';

    const phoneNumber = await provisionPhoneNumber(areaCode);

    logger.info('twilio.provision.success', { userId: user.id, phoneNumber });

    // Save the provisioned number to the user's profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ twilio_phone_number: phoneNumber })
      .eq('id', user.id);

    if (updateError) {
      logger.error('twilio.provision.save_failed', { userId: user.id, error: String(updateError) });
    }

    return NextResponse.json({ phoneNumber });
  } catch (error) {
    logger.error('twilio.provision.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to provision phone number' }, { status: 500 });
  }
}
