'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Lead {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
}

interface LeadCaptureProps {
  initialLeads: Lead[];
}

export function LeadCapture({ initialLeads }: LeadCaptureProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to save lead');
      }

      const data = (await res.json()) as { lead: Lead };
      setLeads([data.lead, ...leads]);
      setName('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLeads(leads.filter((l) => l.id !== id));
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  return (
    <div className="space-y-8">
      {/* Lead Capture Form */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Simulate Incoming Call / Capture Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Caller Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Caller's message or reason for calling..."
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" isLoading={loading}>
            Capture Lead
          </Button>
        </form>
      </div>

      {/* Leads Table */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Captured Leads{' '}
          <span className="ml-2 rounded-full bg-blue-500/20 px-2 py-0.5 text-sm text-blue-400">
            {leads.length}
          </span>
        </h2>
        {leads.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-gray-400">No leads captured yet. Use the form above to add one.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Message</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-300">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                      {lead.message ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
