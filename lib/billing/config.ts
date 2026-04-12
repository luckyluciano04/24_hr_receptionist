import { getBillingEnv } from '@/lib/billing/env';

export const BILLING_PLANS = ['starter', 'professional', 'enterprise'] as const;
export const BILLING_INTERVALS = ['monthly', 'annual'] as const;

export type Plan = (typeof BILLING_PLANS)[number];
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export function isPlan(value: string): value is Plan {
  return BILLING_PLANS.includes(value as Plan);
}

export function isBillingInterval(value: string): value is BillingInterval {
  return BILLING_INTERVALS.includes(value as BillingInterval);
}

export function hasAnnualBillingConfigured(): boolean {
  const env = getBillingEnv();
  return Boolean(
    env.STRIPE_PRICE_STARTER_ANNUAL &&
      env.STRIPE_PRICE_PROFESSIONAL_ANNUAL &&
      env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  );
}

function getPriceIdKey(plan: Plan, interval: BillingInterval): keyof ReturnType<typeof getBillingEnv> {
  if (interval === 'monthly') {
    if (plan === 'starter') return 'STRIPE_PRICE_STARTER';
    if (plan === 'professional') return 'STRIPE_PRICE_PROFESSIONAL';
    return 'STRIPE_PRICE_ENTERPRISE';
  }

  if (plan === 'starter') return 'STRIPE_PRICE_STARTER_ANNUAL';
  if (plan === 'professional') return 'STRIPE_PRICE_PROFESSIONAL_ANNUAL';
  return 'STRIPE_PRICE_ENTERPRISE_ANNUAL';
}

export function resolveStripePriceId(plan: Plan, interval: BillingInterval = 'monthly'): string {
  const env = getBillingEnv();

  if (interval === 'annual' && !hasAnnualBillingConfigured()) {
    throw new Error('[billing.config] Annual billing is not configured');
  }

  const key = getPriceIdKey(plan, interval);
  const value = env[key];
  if (!value) {
    throw new Error(`[billing.config] Missing Stripe price for ${plan}/${interval} (${key})`);
  }
  return value;
}

export function resolvePlanFromPriceId(priceId: string): { plan: Plan; interval: BillingInterval } {
  for (const plan of BILLING_PLANS) {
    if (resolveStripePriceId(plan, 'monthly') === priceId) {
      return { plan, interval: 'monthly' };
    }
  }

  if (hasAnnualBillingConfigured()) {
    for (const plan of BILLING_PLANS) {
      if (resolveStripePriceId(plan, 'annual') === priceId) {
        return { plan, interval: 'annual' };
      }
    }
  }

  throw new Error(`[billing.config] Unknown Stripe price ID: ${priceId}`);
}

