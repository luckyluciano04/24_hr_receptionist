const REQUIRED_BILLING_ENV = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_PROFESSIONAL',
  'STRIPE_PRICE_ENTERPRISE',
] as const;

const OPTIONAL_ANNUAL_ENV = [
  'STRIPE_PRICE_STARTER_ANNUAL',
  'STRIPE_PRICE_PROFESSIONAL_ANNUAL',
  'STRIPE_PRICE_ENTERPRISE_ANNUAL',
] as const;

type BillingEnvKey = (typeof REQUIRED_BILLING_ENV)[number] | (typeof OPTIONAL_ANNUAL_ENV)[number];

function requireEnvValue(key: BillingEnvKey): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`[billing.env] Missing required environment variable: ${key}`);
  }
  return value;
}

function validatePrefix(key: BillingEnvKey, value: string, prefix: string) {
  if (!value.startsWith(prefix)) {
    throw new Error(`[billing.env] ${key} must start with "${prefix}"`);
  }
}

function validateSiteUrl(siteUrl: string) {
  try {
    const parsed = new URL(siteUrl);
    if (!parsed.protocol.startsWith('http')) {
      throw new Error('invalid protocol');
    }
  } catch {
    throw new Error('[billing.env] NEXT_PUBLIC_SITE_URL must be a valid absolute URL');
  }
}

export interface BillingEnv {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_SITE_URL: string;
  STRIPE_PRICE_STARTER: string;
  STRIPE_PRICE_PROFESSIONAL: string;
  STRIPE_PRICE_ENTERPRISE: string;
  STRIPE_PRICE_STARTER_ANNUAL?: string;
  STRIPE_PRICE_PROFESSIONAL_ANNUAL?: string;
  STRIPE_PRICE_ENTERPRISE_ANNUAL?: string;
}

export function getBillingEnv(): BillingEnv {
  const env = {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requireEnvValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    STRIPE_SECRET_KEY: requireEnvValue('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnvValue('STRIPE_WEBHOOK_SECRET'),
    NEXT_PUBLIC_SITE_URL: requireEnvValue('NEXT_PUBLIC_SITE_URL'),
    STRIPE_PRICE_STARTER: requireEnvValue('STRIPE_PRICE_STARTER'),
    STRIPE_PRICE_PROFESSIONAL: requireEnvValue('STRIPE_PRICE_PROFESSIONAL'),
    STRIPE_PRICE_ENTERPRISE: requireEnvValue('STRIPE_PRICE_ENTERPRISE'),
    STRIPE_PRICE_STARTER_ANNUAL: process.env.STRIPE_PRICE_STARTER_ANNUAL?.trim(),
    STRIPE_PRICE_PROFESSIONAL_ANNUAL: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL?.trim(),
    STRIPE_PRICE_ENTERPRISE_ANNUAL: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL?.trim(),
  };

  validatePrefix('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 'pk_');
  validatePrefix('STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY, 'sk_');
  validatePrefix('STRIPE_WEBHOOK_SECRET', env.STRIPE_WEBHOOK_SECRET, 'whsec_');
  validatePrefix('STRIPE_PRICE_STARTER', env.STRIPE_PRICE_STARTER, 'price_');
  validatePrefix('STRIPE_PRICE_PROFESSIONAL', env.STRIPE_PRICE_PROFESSIONAL, 'price_');
  validatePrefix('STRIPE_PRICE_ENTERPRISE', env.STRIPE_PRICE_ENTERPRISE, 'price_');
  validateSiteUrl(env.NEXT_PUBLIC_SITE_URL);

  const annualValues = [
    env.STRIPE_PRICE_STARTER_ANNUAL,
    env.STRIPE_PRICE_PROFESSIONAL_ANNUAL,
    env.STRIPE_PRICE_ENTERPRISE_ANNUAL,
  ];
  const hasSomeAnnual = annualValues.some(Boolean);
  if (hasSomeAnnual && annualValues.some((value) => !value)) {
    throw new Error(
      '[billing.env] Annual billing requires all annual price IDs: STRIPE_PRICE_STARTER_ANNUAL, STRIPE_PRICE_PROFESSIONAL_ANNUAL, STRIPE_PRICE_ENTERPRISE_ANNUAL',
    );
  }

  if (env.STRIPE_PRICE_STARTER_ANNUAL) {
    validatePrefix('STRIPE_PRICE_STARTER_ANNUAL', env.STRIPE_PRICE_STARTER_ANNUAL, 'price_');
    validatePrefix(
      'STRIPE_PRICE_PROFESSIONAL_ANNUAL',
      env.STRIPE_PRICE_PROFESSIONAL_ANNUAL as string,
      'price_',
    );
    validatePrefix(
      'STRIPE_PRICE_ENTERPRISE_ANNUAL',
      env.STRIPE_PRICE_ENTERPRISE_ANNUAL as string,
      'price_',
    );
  }

  return env;
}

