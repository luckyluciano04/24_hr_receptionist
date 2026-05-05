'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function Page() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-slate-400">Secure, passwordless access via magic link.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          {sent ? (
            <p className="text-center">Check your email</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 hover:bg-slate-200 transition disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send link'}
              </button>
              {error ? <p className="text-red-400 text-sm">{error}</p> : null}
            </form>
          )}
        </div>

        <div className="mt-4 text-sm text-slate-400">
          <Link href="/pricing" className="underline">See pricing</Link>
        </div>
      </div>
    </div>
  );
}
