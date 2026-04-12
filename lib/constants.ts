import type { Plan } from '@/lib/billing/config';

export type Tier = Plan;

export const TIER_LIMITS: Record<Tier, number | null> = {
  starter: 100,
  professional: 500,
  enterprise: null, // unlimited
};

export const TIER_PRICES: Record<Tier, number> = {
  starter: 97,
  professional: 197,
  enterprise: 397,
};

export const TIER_FEATURES: Record<Tier, string[]> = {
  starter: ['100 calls/month', 'Email delivery', 'Call transcripts', 'Basic dashboard'],
  professional: ['500 calls/month', 'SMS + Email delivery', 'Call transcripts', 'Full dashboard', 'Priority support'],
  enterprise: [
    'Unlimited calls',
    'Slack + SMS + Email + CRM push',
    'Call transcripts',
    'Full dashboard',
    'Dedicated account manager',
    'Custom integrations',
  ],
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://24hrreceptionist.com';

export const TRIAL_PERIOD_DAYS = 7;
