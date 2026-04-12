import { NextResponse } from 'next/server';
import { getBillingEnv } from '@/lib/billing/env';
import { BILLING_PLANS, hasAnnualBillingConfigured, resolveStripePriceId } from '@/lib/billing/config';

export async function GET() {
  try {
    const env = getBillingEnv();

    const resolvedMonthly = BILLING_PLANS.reduce<Record<string, string>>((acc, plan) => {
      acc[plan] = resolveStripePriceId(plan, 'monthly');
      return acc;
    }, {});

    const annualEnabled = hasAnnualBillingConfigured();
    const resolvedAnnual = annualEnabled
      ? BILLING_PLANS.reduce<Record<string, string>>((acc, plan) => {
          acc[plan] = resolveStripePriceId(plan, 'annual');
          return acc;
        }, {})
      : null;

    return NextResponse.json({
      ok: true,
      stripeConfigured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
      annualEnabled,
      monthlyPrices: resolvedMonthly,
      annualPrices: resolvedAnnual,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Billing misconfiguration',
      },
      { status: 500 },
    );
  }
}
