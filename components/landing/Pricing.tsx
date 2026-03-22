'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TIER_PRICES, TIER_FEATURES } from '@/lib/constants';
import type { Tier } from '@/lib/constants';

const tiers: { id: Tier; name: string; popular?: boolean }[] = [
  { id: 'starter', name: 'Starter' },
  { id: 'professional', name: 'Professional', popular: true },
  { id: 'enterprise', name: 'Enterprise' },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-xl text-gray-400">
            Start your 7-day free trial today. No credit card required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.popular ? 'highlight' : 'default'}
              className="relative flex flex-col"
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="mb-2 text-xl font-bold text-white">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${TIER_PRICES[tier.id]}
                  </span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {TIER_FEATURES[tier.id].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-gray-300">
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={`/signup?plan=${tier.id}`} className="mt-auto">
                <Button
                  variant={tier.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  Get Started
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
