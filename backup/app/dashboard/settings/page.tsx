'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '../../../lib/supabase/client';
import { TIER_PRICES } from '@/lib/constants';
import type { Tier } from '@/lib/constants';

interface Profile {
  email: string;
  business_name: string | null;
  phone: string | null;
  tier: Tier;
  subscription_status: string;
  twilio_phone_number: string | null;
  calls_this_month: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('email, business_name, phone, tier, subscription_status, twilio_phone_number, calls_this_month')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data as Profile);
        setBusinessName(data.business_name ?? '');
        setPhone(data.phone ?? '');
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSaveMessage('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ business_name: businessName, phone })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setSaveMessage('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleManageBilling() {
    setIsLoadingPortal(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to open billing portal');
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open billing portal');
      setIsLoadingPortal(false);
    }
  }

  const tier = profile?.tier ?? 'starter';
  const statusVariant =
    profile?.subscription_status === 'active'
      ? 'success'
      : profile?.subscription_status === 'trialing'
        ? 'blue'
        : 'warning';

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-2xl font-bold text-white">Account Settings</h1>

          {/* Account Info */}
          <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Account Information</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Email</label>
                <p className="text-white">{profile?.email ?? '...'}</p>
              </div>
              <Input
                id="businessName"
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <Input
                id="phone"
                label="Phone Number (for SMS notifications)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              {saveMessage && (
                <p className="text-sm text-green-400">{saveMessage}</p>
              )}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </form>
          </section>

          {/* Subscription */}
          <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Subscription</h2>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-medium capitalize text-white">{tier} Plan</p>
                <p className="text-sm text-gray-400">${TIER_PRICES[tier as Tier]}/month</p>
              </div>
              <Badge variant={statusVariant} className="capitalize">
                {profile?.subscription_status ?? 'inactive'}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={handleManageBilling}
              isLoading={isLoadingPortal}
            >
              Manage Billing
            </Button>
          </section>

          {/* Phone Number */}
          <section className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Your Receptionist Number</h2>
            {profile?.twilio_phone_number ? (
              <>
                <p className="mb-1 text-2xl font-bold text-blue-400">
                  {profile.twilio_phone_number}
                </p>
                <p className="text-sm text-gray-400">
                  Forward your business calls to this number to activate your AI receptionist.
                </p>
              </>
            ) : (
              <p className="text-gray-400">
                Complete onboarding to get your dedicated receptionist number.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
