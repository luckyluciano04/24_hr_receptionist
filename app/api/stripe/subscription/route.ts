import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import {
  hasAnnualBillingConfigured,
  isBillingInterval,
  isPlan,
  resolveStripePriceId,
  type BillingInterval,
  type Plan,
} from '@/lib/billing/config';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { plan: string; interval?: string };
    const requestedInterval = body.interval?.toLowerCase() ?? 'monthly';

    if (!isPlan(body.plan)) {
      return NextResponse.json({ error: 'Invalid plan value' }, { status: 400 });
    }
    if (!isBillingInterval(requestedInterval)) {
      return NextResponse.json({ error: 'Invalid billing interval value' }, { status: 400 });
    }
    if (requestedInterval === 'annual' && !hasAnnualBillingConfigured()) {
      return NextResponse.json({ error: 'Annual billing is not enabled' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId) {
      return NextResponse.json({ error: 'No subscription item found' }, { status: 400 });
    }

    const plan = body.plan as Plan;
    const interval = requestedInterval as BillingInterval;
    const targetPriceId = resolveStripePriceId(plan, interval);

    await stripe.subscriptions.update(subscription.id, {
      items: [{ id: itemId, price: targetPriceId }],
      proration_behavior: 'create_prorations',
      metadata: {
        ...subscription.metadata,
        plan,
        interval,
        source: 'self_serve_upgrade_downgrade',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
