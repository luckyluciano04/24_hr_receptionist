import { Badge } from '@/components/ui/Badge';

interface CallCardProps {
  callerName: string | null;
  callerPhone: string | null;
  summary: string | null;
  duration: number | null;
  createdAt: string;
  deliveredVia: string[] | null;
}

export function CallCard({
  callerName,
  callerPhone,
  summary,
  duration,
  createdAt,
  deliveredVia,
}: CallCardProps) {
  const date = new Date(createdAt);
  const mins = duration ? Math.floor(duration / 60) : 0;
  const secs = duration ? duration % 60 : 0;
  const durationStr = duration
    ? mins > 0
      ? `${mins}m ${secs}s`
      : `${secs}s`
    : 'N/A';

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-white">{callerName ?? 'Unknown Caller'}</p>
          <p className="text-sm text-gray-400">{callerPhone ?? 'Unknown Number'}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{date.toLocaleDateString()}</p>
          <p>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {summary && (
        <p className="mb-3 text-sm text-gray-400 line-clamp-2">{summary}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">⏱ {durationStr}</Badge>
        {deliveredVia?.map((method) => (
          <Badge key={method} variant="blue">
            {method === 'email' ? '📧' : method === 'sms' ? '📱' : '🔔'} {method}
          </Badge>
        ))}
      </div>
    </div>
  );
}
