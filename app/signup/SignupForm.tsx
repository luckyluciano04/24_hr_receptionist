'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SignUpForm() {
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        {sent ? (
          <p className="text-center text-white">Check your email for a secure login link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-slate-950 outline-none transition focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>

            {error && <p className="text-sm text-red-300">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
