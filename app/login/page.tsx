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

  // AFTER SUBMIT
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">
          
          <h1 className="text-3xl font-bold">
            Check your email
          </h1>

          <p className="mt-3 text-white/70">
            Your secure access link has been sent.
          </p>

          <p className="mt-2 text-sm text-white/50">
            Opens instantly. No password required.
          </p>

          <div className="mt-6">
            <Link
              href="/pricing"
              className="w-full block text-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
            >
              View plans while you wait
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // MAIN LOGIN UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6">

        {/* BRAND */}
        <p className="text-sm text-white/50 uppercase tracking-wide">
          24hrReceptionist.com
        </p>

        {/* HEADLINE (HIGH IMPACT) */}
        <h1 className="mt-2 text-3xl font-bold leading-tight">
          Access your AI receptionist
        </h1>

        {/* SUBHEAD */}
        <p className="mt-2 text-white/70">
          Every call answered. Every lead captured. Instantly.
        </p>

        {/* FORM */}
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
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 transition px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Sending secure link...' : 'Send secure access link'}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-red-400 text-sm">
            {error}
          </p>
        )}

        {/* SECONDARY CTA */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href="/pricing"
            className="w-full block text-center rounded-xl border border-white/15 px-4 py-3 font-medium text-white"
          >
            See pricing
          </Link>
        </div>

        {/* TRUST LINE */}
        <p className="mt-4 text-xs text-white/40 text-center">
          No password • Instant access • Enterprise-grade security
        </p>

      </div>
    </div>
  );
}
    