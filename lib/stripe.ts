import Stripe from 'stripe';
import { getBillingEnv } from '@/lib/billing/env';

function getStripe(): Stripe {
  const { STRIPE_SECRET_KEY: key } = getBillingEnv();
  return new Stripe(key, {
    apiVersion: '2026-02-25.clover',
    typescript: true,
  });
}

// Lazy singleton
let _stripe: Stripe | null = null;

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = getStripe();
    }
    const value = (_stripe as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(_stripe);
    }
    return value;
  },
});
