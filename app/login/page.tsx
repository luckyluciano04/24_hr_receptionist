'use client';

import { useState } from 'react';
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
      <div style={{ padding: 20 }}>
        <h2>Check your email</h2>
        <p>We sent you a login link.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Sign in</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}