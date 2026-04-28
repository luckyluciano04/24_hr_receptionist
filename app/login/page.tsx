'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function Page() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Check your email</h2>
          <p className="mt-2 text-white/70">
            We sent you a login link. Open it to continue.
          </p>
          <div className="mt-6">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white"
            >
              View pricing and start
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-3xl font-semibold">24hr Receptionist</h1>
        <p className="mt-2 text-white/70">
          Sign in to continue, or go straight to pricing.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        {error && <p className="mt-3 text-red-400">{error}</p>}

        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-3 font-medium text-white"
          >
            See pricing
          </Link>
        </div>
      </div>
    </div>
  );
}