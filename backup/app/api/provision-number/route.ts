import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { provisionPhoneNumber } from '@/lib/twilio';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { areaCode?: string };
    const areaCode = (body.areaCode ?? '415').replace(/\D/g, '').slice(0, 3) || '415';

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const phoneNumber = await provisionPhoneNumber(areaCode);

    const { error } = await supabase
      .from('profiles')
      .update({ twilio_phone_number: phoneNumber })
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ phoneNumber });
  } catch (error) {
    logger.error('twilio.provision_number.error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to provision phone number' }, { status: 500 });
  }
}
