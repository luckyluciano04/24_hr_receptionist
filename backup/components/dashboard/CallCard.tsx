import { Badge } from '@/components/ui/Badge';

interface CallCardProps {
  fromNumber: string | null;
  toNumber: string | null;
  status: string | null;
  duration: number | null;
  createdAt: string;
  recordingUrl: string | null;
  callTranscript: string | null;
  callSummary: string | null;
}

export function CallCard({
  fromNumber,
  toNumber,
  status,
  duration,
  createdAt,
  recordingUrl,
  callTranscript,
  callSummary,
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
          <p className="font-semibold text-white">{fromNumber ?? 'Unknown Number'}</p>
          <p className="text-sm text-gray-400">→ {toNumber ?? 'Unknown Number'}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{date.toLocaleDateString()}</p>
          <p>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {status && <Badge variant="default">{status}</Badge>}
        <Badge variant="default">⏱ {durationStr}</Badge>
      </div>

      {recordingUrl && (
        <div className="mt-3">
          <audio controls className="w-full">
            <source src={recordingUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {callSummary && (
        <div className="mt-3">
          <p className="text-sm text-gray-300">{callSummary}</p>
        </div>
      )}

      {callTranscript && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
            View Transcript
          </summary>
          <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{callTranscript}</p>
        </details>
      )}
    </div>
  );
}
