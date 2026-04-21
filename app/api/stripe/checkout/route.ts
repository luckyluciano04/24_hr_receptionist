import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { STRIPE_PRICE_IDS, TRIAL_PERIOD_DAYS, APP_URL, type Tier } from '@/lib/constants';
import { createAdminClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      plan: string;
      email: string;
      businessName: string;
    };
    const { plan, email, businessName } = body;

    if (!plan || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate plan and resolve price ID server-side (keeps STRIPE_PRICE_* server-only)
    const tier = (Object.keys(STRIPE_PRICE_IDS).includes(plan) ? plan : 'starter') as Tier;
    const priceId = STRIPE_PRICE_IDS[tier];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
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
      // customer_email must be omitted when customer is provided (Stripe API requirement)
      customer_email: customerId ? undefined : email,
      metadata: { tier, businessName, email },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
