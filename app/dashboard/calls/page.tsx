'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CallCard } from '@/components/dashboard/CallCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '../../../lib/supabase/client';

interface Call {
  id: string;
  from_number: string | null;
  to_number: string | null;
  status: string | null;
  duration: number | null;
  created_at: string;
  recording_url: string | null;
  call_transcript: string | null;
  call_summary: string | null;
}

function exportToCSV(calls: Call[]) {
  const headers = ['Date', 'Time', 'From Number', 'To Number', 'Duration (s)', 'Status'];
  const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const rows = calls.map((c) => [
    new Date(c.created_at).toLocaleDateString(),
    new Date(c.created_at).toLocaleTimeString(),
    c.from_number ?? '',
    c.to_number ?? '',
    String(c.duration ?? ''),
    c.status ?? '',
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escapeCSV).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calls-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CallsPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      params.set('limit', '100');

      const res = await fetch(`/api/calls?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch calls');
      const data = (await res.json()) as { calls: Call[] };
      setCalls(data.calls ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    void fetchCalls();
  }, [fetchCalls]);

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Call Log</h1>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCSV(calls)}
              disabled={calls.length === 0}
            >
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              label="Search"
            />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              label="From Date"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              label="To Date"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : calls.length > 0 ? (
            <div className="space-y-3">
              {calls.map((call) => (
                <CallCard
                  key={call.id}
                  fromNumber={call.from_number}
                  toNumber={call.to_number}
                  status={call.status}
                  duration={call.duration}
                  createdAt={call.created_at}
                  recordingUrl={call.recording_url}
                  callTranscript={call.call_transcript}
                  callSummary={call.call_summary}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No calls found"
              description="No calls match your search criteria."
              actionLabel="Clear Filters"
              actionHref="/dashboard/calls"
            />
          )}
        </div>
      </main>
    </div>
  );
}
