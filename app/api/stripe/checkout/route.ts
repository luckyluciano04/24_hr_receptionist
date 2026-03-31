import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICE_IDS, TRIAL_PERIOD_DAYS, APP_URL, type Tier } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      priceId: string;
      email: string;
      businessName: string;
    };
    const { priceId, email, businessName } = body;

    if (!priceId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate priceId is one of our known price IDs
    const validPriceIds = Object.values(STRIPE_PRICE_IDS);
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if customer already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('email', email)
      .single();

    let customerId: string | undefined = existingProfile?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: businessName,
        metadata: { businessName },
      });
      customerId = customer.id;
    }

    // Determine tier from priceId
    const tier = (Object.entries(STRIPE_PRICE_IDS).find(
      ([, id]) => id === priceId,
    )?.[0] ?? 'starter') as Tier;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS,
        metadata: { tier, businessName, email },
      },
      success_url: `${APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
      allow_promotion_codes: true,
      metadata: { tier, businessName, email },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('stripe.checkout_error', { error: String(error) });
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
