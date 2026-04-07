'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Lead {
  id: string;
  call_sid: string;
  name: string | null;
  intent_score: number;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed',
  lost: 'Lost',
};

const STATUS_COLORS: Record<string, 'blue' | 'success' | 'warning' | 'error' | 'default'> = {
  new: 'blue',
  contacted: 'warning',
  qualified: 'success',
  closed: 'success',
  lost: 'error',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = (await res.json()) as { leads: Lead[] };
      setLeads(data.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      );
    } catch {
      // silently ignore update errors
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Lead Inbox</h1>
              <p className="mt-1 text-gray-400">Leads captured from inbound calls.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void fetchLeads()}>
              Refresh
            </Button>
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
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 text-center">
              <p className="text-lg font-medium text-white">No leads yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Leads will appear here when callers express interest.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Call SID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Score</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="bg-white/[0.02] hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">
                        {lead.name ?? <span className="text-gray-500 italic">Unknown</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {lead.call_sid}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            lead.intent_score >= 80
                              ? 'text-green-400'
                              : lead.intent_score >= 50
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                          }`}
                        >
                          {lead.intent_score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[lead.status] ?? 'default'}>
                          {STATUS_LABELS[lead.status] ?? lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded bg-white/10 px-2 py-1 text-xs text-white disabled:opacity-50"
                          value={lead.status}
                          disabled={updating === lead.id}
                          onChange={(e) => void updateStatus(lead.id, e.target.value)}
                        >
                          {Object.entries(STATUS_LABELS).map(([val, label]) => (
                            <option key={val} value={val} className="bg-[#1a1a1a]">
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
