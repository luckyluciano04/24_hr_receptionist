import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { TRIAL_PERIOD_DAYS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/server';
import {
  hasAnnualBillingConfigured,
  isBillingInterval,
  isPlan,
  resolveStripePriceId,
  type BillingInterval,
  type Plan,
} from '@/lib/billing/config';
import { getBillingEnv } from '@/lib/billing/env';

export async function POST(request: NextRequest) {
  try {
    const { NEXT_PUBLIC_SITE_URL } = getBillingEnv();
    const body = (await request.json()) as {
      plan: string;
      interval?: string;
      email: string;
      businessName: string;
    };
    const { plan, interval, email, businessName } = body;

    if (!plan || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isPlan(plan)) {
      return NextResponse.json({ error: 'Invalid plan value' }, { status: 400 });
    }

    const normalizedInterval = interval?.toLowerCase() ?? 'monthly';
    if (!isBillingInterval(normalizedInterval)) {
      return NextResponse.json({ error: 'Invalid billing interval value' }, { status: 400 });
    }

    if (normalizedInterval === 'annual' && !hasAnnualBillingConfigured()) {
      return NextResponse.json({ error: 'Annual billing is not enabled' }, { status: 400 });
    }

    const selectedPlan = plan as Plan;
    const selectedInterval = normalizedInterval as BillingInterval;
    const priceId = resolveStripePriceId(selectedPlan, selectedInterval);

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
        metadata: {
          plan: selectedPlan,
          interval: selectedInterval,
          source: 'signup',
          businessName,
          email,
        },
      },
      success_url: `${NEXT_PUBLIC_SITE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_SITE_URL}/pricing`,
      allow_promotion_codes: true,
      // customer_email must be omitted when customer is provided (Stripe API requirement)
      customer_email: customerId ? undefined : email,
      metadata: {
        plan: selectedPlan,
        interval: selectedInterval,
        source: 'signup',
        businessName,
        email,
        account_identifier: email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
