'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) throw authError;
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="mb-8 block text-lg font-bold text-white">
            24hr Receptionist
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-4xl">📬</div>
            <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
            <p className="text-gray-400">
              We sent a sign-in link to <span className="font-semibold text-white">{email}</span>.
              Click it to access your dashboard.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Didn&apos;t receive it?{' '}
              <button
                onClick={() => setIsSent(false)}
                className="text-blue-400 hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-lg font-bold text-white">
          24hr Receptionist
        </Link>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Sign in</h1>
          <p className="mb-6 text-gray-400">
            Enter your email and we&apos;ll send you a magic link to sign in.
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

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send magic link →
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
