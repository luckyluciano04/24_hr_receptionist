'use client';

import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CallCard } from '@/components/dashboard/CallCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Call {
  id: string;
  caller_name: string | null;
  caller_phone: string | null;
  call_summary: string | null;
  call_transcript: string | null;
  call_duration_seconds: number | null;
  created_at: string;
  delivered_via: string[] | null;
}

function exportToCSV(calls: Call[]) {
  const headers = ['Date', 'Time', 'Caller Name', 'Caller Phone', 'Duration (s)', 'Summary', 'Delivered Via'];
  const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const rows = calls.map((c) => [
    new Date(c.created_at).toLocaleDateString(),
    new Date(c.created_at).toLocaleTimeString(),
    c.caller_name ?? '',
    c.caller_phone ?? '',
    String(c.call_duration_seconds ?? ''),
    c.call_summary ?? '',
    (c.delivered_via ?? []).join(', '),
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
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
