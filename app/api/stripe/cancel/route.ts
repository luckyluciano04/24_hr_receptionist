import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const cancellationReason = body.reason?.trim() || null;

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

    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: cancellationReason ?? '',
      },
    });

    await supabase
      .from('profiles')
      .update({
        cancel_at_period_end: true,
        cancellation_reason: cancellationReason,
      })
      .eq('id', user.id);

    return NextResponse.json({
      ok: true,
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
