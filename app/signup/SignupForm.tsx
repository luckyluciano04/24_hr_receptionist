'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TIER_PRICES, type Tier } from '@/lib/constants';

export default function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = (searchParams.get('plan') ?? 'starter') as Tier;

  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email, businessName }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to create checkout session');
      }

      const data = (await res.json()) as { url: string };
      if (data.url) {
        router.push(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-lg font-bold text-white">
          24hr Receptionist
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Start your free trial</h1>
          <p className="mb-6 text-gray-400">
            7 days free, then{' '}
            <span className="font-semibold text-white">
              ${TIER_PRICES[plan]}/month
            </span>{' '}
            for the{' '}
            <span className="capitalize font-semibold text-blue-400">{plan}</span> plan.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              id="businessName"
              type="text"
              label="Business name"
              placeholder="Mike's Plumbing"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Continue to Payment →
            </Button>

            <p className="text-center text-sm text-gray-500">
              No credit card required for trial. Cancel anytime.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/dashboard" className="text-blue-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
