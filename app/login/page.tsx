'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link. Please try again.');
    } finally {
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
          {sent ? (
            <div className="text-center">
              <div className="mb-4 text-5xl">📬</div>
              <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
              <p className="text-gray-400">
                We sent a sign-in link to <span className="font-semibold text-white">{email}</span>.
                Click it to access your dashboard.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Didn&apos;t receive it?{' '}
                <button
                  className="text-blue-400 hover:underline"
                  onClick={() => setSent(false)}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-bold text-white">Sign in</h1>
              <p className="mb-6 text-gray-400">
                Enter your email and we&apos;ll send you a sign-in link.
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
                  Send Sign-in Link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-blue-400 hover:underline">
                  Start free trial
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
