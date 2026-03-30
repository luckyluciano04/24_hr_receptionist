import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { CallCard } from '@/components/dashboard/CallCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import Link from 'next/link';
import type { Tier } from '@/lib/constants';

interface Call {
  id: string;
  caller_name: string | null;
  caller_phone: string | null;
  call_summary: string | null;
  call_duration_seconds: number | null;
  created_at: string;
  delivered_via: string[] | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: calls } = await supabase
    .from('calls')
    .select('id, caller_name, caller_phone, call_summary, call_duration_seconds, created_at, delivered_via')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const tier = (profile?.tier ?? 'starter') as Tier;
  const callsThisMonth = profile?.calls_this_month ?? 0;
  const subscriptionStatus = profile?.subscription_status ?? 'inactive';

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}
              </h1>
              <p className="mt-1 text-gray-400">Here&apos;s your call activity overview.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/settings"
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:border-white/20 hover:text-white transition-colors"
              >
                Manage Billing
              </Link>
              <Link
                href="/onboarding"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Update Business Info
              </Link>
            </div>
          </div>

          <div className="mb-8">
            <StatsBar
              tier={tier}
              callsThisMonth={callsThisMonth}
              subscriptionStatus={subscriptionStatus}
            />
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Calls</h2>
              <Link href="/dashboard/calls" className="text-sm text-blue-400 hover:underline">
                View all →
              </Link>
            </div>

            {calls && calls.length > 0 ? (
              <div className="space-y-3">
                {(calls as Call[]).map((call) => (
                  <CallCard
                    key={call.id}
                    callerName={call.caller_name}
                    callerPhone={call.caller_phone}
                    summary={call.call_summary}
                    duration={call.call_duration_seconds}
                    createdAt={call.created_at}
                    deliveredVia={call.delivered_via}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
