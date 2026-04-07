'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Appointment {
  id: string;
  call_sid: string;
  time: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, 'blue' | 'success' | 'warning' | 'error' | 'default'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'blue',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Failed to fetch appointments');
      const data = (await res.json()) as { appointments: Appointment[] };
      setAppointments(data.appointments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a)),
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
              <h1 className="text-2xl font-bold text-white">Appointments</h1>
              <p className="mt-1 text-gray-400">Bookings captured from inbound calls.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void fetchAppointments()}>
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
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 text-center">
              <p className="text-lg font-medium text-white">No appointments yet</p>
              <p className="mt-2 text-sm text-gray-400">
                Appointments will appear here when callers request bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Date &amp; Time</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Call SID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Booked At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.map((appt) => (
                    <tr
                      key={appt.id}
                      className="bg-white/[0.02] hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {appt.time
                          ? new Date(appt.time).toLocaleString()
                          : <span className="text-gray-500 italic">TBD</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {appt.call_sid}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[appt.status] ?? 'default'}>
                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(appt.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded bg-white/10 px-2 py-1 text-xs text-white disabled:opacity-50"
                          value={appt.status}
                          disabled={updating === appt.id}
                          onChange={(e) => void updateStatus(appt.id, e.target.value)}
                        >
                          {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
                            <option key={s} value={s} className="bg-[#1a1a1a]">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
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
