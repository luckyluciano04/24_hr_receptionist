'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TIER_PRICES, TIER_FEATURES } from '@/lib/constants';
import type { Tier } from '@/lib/constants';

const tiers: { id: Tier; name: string; blurb: string; popular?: boolean }[] = [
  { id: 'starter', name: 'Starter', blurb: 'For solo operators validating live capture.' },
  { id: 'professional', name: 'Professional', blurb: 'For teams converting missed calls into revenue.', popular: true },
  { id: 'enterprise', name: 'Enterprise', blurb: 'For multi-location operations and higher volume.' },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Pricing
          </div>
          <h2 className="text-3xl font-bold text-slate-950 sm:text-5xl">
            Enterprise-grade call capture for every stage.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Every plan includes 24/7 answering, lead qualification, transcripts, and access to the account dashboard.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.popular ? 'highlight' : 'default'}
              className={`relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm ${tier.popular ? 'ring-2 ring-slate-950' : ''}`}
            >
              {tier.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {tier.name}
                </div>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {tier.blurb}
                </h3>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tight text-slate-950">
                    ${TIER_PRICES[tier.id]}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">/month</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {TIER_FEATURES[tier.id].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto border-t border-slate-200 bg-slate-50 p-6">
                <Link href={`/api/stripe/checkout?plan=${tier.id}`} className="block">
                  <Button variant={tier.popular ? 'primary' : 'outline'} className="w-full">
                    Start {tier.name}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
